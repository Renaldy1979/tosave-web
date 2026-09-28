import { API_URL } from "./env";

/** Tipos das rotas `/v2/public/*` (backendToSave/docs/API-V2.md, seção Pública). */

export type Page<T> = { items: T[]; total: number | null; nextCursor: string | null };

export type CarItem = {
  id: string;
  title: string;
  description: string;
  brandId: string;
  brandName: string;
  serieId: string;
  serieTitle: string;
  seriePosition: string | null;
  seriePositionNum: number | null;
  collector: string;
  color: string;
  toy: string;
  year: number;
  scale: string;
  imageFileId: string | null;
  attributeIds: string[];
};

export type PublicCarDetail = CarItem & {
  brand: { id: string; name: string };
  serie: { id: string; title: string; description: string; imageFileId: string | null; isDefault: boolean; carCount: number };
  attributes: { id: string; title: string; description: string | null }[];
  images: unknown[];
};

/** `totalMembers` vem `null` enquanto a comunidade não bater `minMembersToShow` (`GET /admin/config`). */
export type PublicStats = { totalCars: number; totalSeries: number; totalMembers: number | null; totalCollected: number };

export type PublicFeaturedSerie = { id: string; title: string; description: string; imageFileId: string | null; carCount: number };

/** `GET /v2/config`: config pública do app (`app_config`). Campo vazio = recurso escondido. */
export type PublicConfig = { termsUrl: string; privacyUrl: string; supportEmail: string; passwordRecoveryUrl: string; minAppVersion: string };

export class PublicApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type QueryValue = string | number | boolean | undefined | null | ReadonlyArray<string | number>;
type Query = Record<string, QueryValue>;

function buildUrl(path: string, query?: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  const qs = params.toString();
  return `${API_URL}${path}${qs ? `?${qs}` : ""}`;
}

/**
 * `X-Site-Key` isenta o site do limite por IP da API (Orquestrador,
 * 26/09/2026). Só no servidor (SSR, `generateMetadata`, `sitemap.ts`): a
 * env `PUBLIC_SITE_KEY` (sem `NEXT_PUBLIC_`) não existe no navegador, e a
 * checagem de `window` garante que o valor nunca é lido lá.
 */
function siteKeyHeaders(): HeadersInit {
  if (typeof window !== "undefined") return {};
  const key = process.env.PUBLIC_SITE_KEY;
  return key ? { "X-Site-Key": key } : {};
}

/**
 * Rotas públicas (sem login) do site institucional. `revalidate` casa com o
 * `Cache-Control` do backend (60 a 300 s, docs/API-V2.md §Pública); em
 * chamadas do navegador (filtro do `/vitrine`) fica de fora, junto com o
 * `X-Site-Key`.
 */
async function publicApi<T>(path: string, opts: { query?: Query; revalidate?: number; signal?: AbortSignal } = {}): Promise<T> {
  const url = buildUrl(path, opts.query);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json", ...siteKeyHeaders() },
      signal: opts.signal,
      ...(opts.revalidate !== undefined ? { next: { revalidate: opts.revalidate } } : {}),
    });
  } catch (err) {
    if (opts.signal?.aborted) throw err;
    throw new PublicApiError(0, "Sem conexão.");
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
  throw new PublicApiError(res.status, message);
}

export type ShowcaseQuery = { q?: string; years?: string; serieId?: string; brandId?: string; attributeIds?: string; cursor?: string | null; limit?: number };

export const loadShowcase = (query: ShowcaseQuery, opts: { revalidate?: number; signal?: AbortSignal } = {}) =>
  publicApi<Page<CarItem>>("/v2/public/showcase", { query, ...opts });

export const loadPublicCar = (id: string, opts: { revalidate?: number } = {}) =>
  publicApi<PublicCarDetail>(`/v2/public/cars/${encodeURIComponent(id)}`, { revalidate: 120, ...opts });

export const loadPublicStats = (opts: { revalidate?: number } = {}) => publicApi<PublicStats>("/v2/public/stats", { revalidate: 300, ...opts });

export const loadFeaturedSeries = (opts: { revalidate?: number } = {}) =>
  publicApi<PublicFeaturedSerie[]>("/v2/public/series", { revalidate: 300, ...opts });

export const loadPublicConfig = (opts: { revalidate?: number; signal?: AbortSignal } = {}) =>
  publicApi<PublicConfig>("/v2/config", { revalidate: 300, ...opts });
