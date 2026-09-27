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
