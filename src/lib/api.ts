"use client";

import { account } from "./appwrite";
import { API_URL } from "./env";

/**
 * Cliente REST da API v2 (`backendToSave/docs/API-V2.md`).
 *
 * - Autenticação: `Authorization: Bearer <JWT do Appwrite>`. O JWT vale
 *   15 min; fica em cache e é renovado com 2 min de folga ou ao receber
 *   401 (uma nova tentativa).
 * - Erros viram `ApiError` com o status HTTP e a `message` do backend.
 */
export class ApiError extends Error {
  /** Status HTTP; 0 quando não houve resposta (rede/timeout). */
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 20_000;
const JWT_TTL_MS = 13 * 60 * 1000;

let jwtCache: { token: string; at: number } | null = null;
let jwtInFlight: Promise<string> | null = null;
let onUnauthorized: (() => void) | null = null;

/** Esquece o JWT (sair, troca de conta, 401). */
export function clearJwt() {
  jwtCache = null;
  jwtInFlight = null;
}

/** Chamado quando a sessão morre (401 depois de renovar o JWT). */
export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function getJwt(force = false): Promise<string> {
  if (!force && jwtCache && Date.now() - jwtCache.at < JWT_TTL_MS) return jwtCache.token;
  if (!jwtInFlight) {
    jwtInFlight = account
      .createJWT()
      .then(({ jwt }) => {
        jwtCache = { token: jwt, at: Date.now() };
        return jwt;
      })
      .catch((err: unknown) => {
        const status = typeof (err as { code?: unknown })?.code === "number" ? (err as { code: number }).code : 0;
        if (status === 401) throw new ApiError(401, "Sessão expirada.");
        throw new ApiError(0, "Sem conexão.");
      })
      .finally(() => {
        jwtInFlight = null;
      });
  }
  return jwtInFlight;
}

export type QueryValue = string | number | boolean | undefined | null | ReadonlyArray<string | number>;
export type Query = Record<string, QueryValue>;

export type ApiRequest = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Query;
  /** Objeto (vai como JSON) ou `FormData` (upload). */
  body?: unknown;
  /** Rota pública (sem JWT), ex.: `/v2/config`. */
  auth?: boolean;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    const v = Array.isArray(value) ? value.join(",") : String(value);
    if (v !== "") params.set(key, v);
  }
  const qs = params.toString();
  return `${API_URL}${path}${qs ? `?${qs}` : ""}`;
}

async function send(url: string, req: ApiRequest, jwt: string | null): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abort = () => controller.abort();
  req.signal?.addEventListener("abort", abort);
  const isForm = typeof FormData !== "undefined" && req.body instanceof FormData;
  try {
    return await fetch(url, {
      method: req.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(req.body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: req.body === undefined ? undefined : isForm ? (req.body as FormData) : JSON.stringify(req.body),
      signal: controller.signal,
    });
  } catch (err) {
    if (req.signal?.aborted) throw err;
    throw new ApiError(0, "Sem conexão.");
  } finally {
    clearTimeout(timer);
    req.signal?.removeEventListener("abort", abort);
  }
}

/** Chamada à API; devolve o JSON da resposta. */
export async function api<T>(path: string, req: ApiRequest = {}): Promise<T> {
  const url = buildUrl(path, req.query);
  const needsAuth = req.auth !== false;

  let res: Response;
  try {
    res = await send(url, req, needsAuth ? await getJwt() : null);
    if (res.status === 401 && needsAuth) {
      // O JWT pode ter vencido antes do previsto: renova e tenta de novo.
      res = await send(url, req, await getJwt(true));
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearJwt();
      onUnauthorized?.();
    }
    throw err;
  }

  if (res.ok) {
    const text = await res.text();
    return (text ? JSON.parse(text) : null) as T;
  }

  let message = `Erro ${res.status}`;
  try {
    const payload = (await res.json()) as { message?: unknown };
    if (typeof payload.message === "string" && payload.message) message = payload.message;
  } catch {
    // corpo sem JSON: fica a mensagem genérica.
  }
  if (res.status === 401 && needsAuth) {
    clearJwt();
    onUnauthorized?.();
  }
  throw new ApiError(res.status, message);
}

/** Mensagem de erro para a interface. */
export function errorMessage(err: unknown, fallback = "Não foi possível concluir. Tente novamente."): string {
  if (err instanceof ApiError) {
    if (err.status === 0) return "Sem conexão com o servidor. Verifique sua internet.";
    return err.message || fallback;
  }
  return fallback;
}
