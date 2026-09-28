"use client";

import { Account, AppwriteException, Client, ID } from "appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "./env";

/**
 * Appwrite no navegador: só login/cadastro (sessão + JWT) e imagens
 * (Storage, lido direto pela URL de preview). Os dados vêm da API (`api.ts`).
 */
export const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);

export { AppwriteException, ID };

/**
 * UUID v4 para o `$id` da conta no cadastro: a v2 exige que seja o mesmo
 * `users.id` do Postgres (`backendToSave/docs/API-V2.md`); `ID.unique()`
 * do Appwrite não serve.
 */
export function uuidV4(): string {
  const hex: string[] = [];
  for (let i = 0; i < 16; i++) hex.push(Math.floor(Math.random() * 256).toString(16).padStart(2, "0"));
  hex[6] = ((parseInt(hex[6], 16) & 0x0f) | 0x40).toString(16).padStart(2, "0");
  hex[8] = ((parseInt(hex[8], 16) & 0x3f) | 0x80).toString(16).padStart(2, "0");
  const h = hex.join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** `status` e `type` de um erro do Appwrite (0 e "" quando não é). */
export function appwriteErrorInfo(err: unknown): { status: number; type: string } {
  if (!(err instanceof AppwriteException)) return { status: 0, type: "" };
  let type = err.type ?? "";
  if (!type && typeof err.response === "string" && err.response) {
    try {
      const parsed = JSON.parse(err.response) as { type?: unknown };
      if (typeof parsed.type === "string") type = parsed.type;
    } catch {
      // `response` sem JSON: fica sem `type`.
    }
  }
  return { status: err.code ?? 0, type };
}

export { brandLogoUrl, carImageUrl, newsImageUrl, serieLogoUrl } from "./storage-url";
