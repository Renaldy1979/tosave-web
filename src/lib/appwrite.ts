"use client";

import { Account, AppwriteException, Client, ID } from "appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, BUCKET_BRAND_LOGOS, BUCKET_CAR_IMAGES, BUCKET_SERIES_LOGOS } from "./env";

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

function previewUrl(bucket: string, fileId: string, width: number, quality: number): string {
  return (
    `${APPWRITE_ENDPOINT}/storage/buckets/${encodeURIComponent(bucket)}` +
    `/files/${encodeURIComponent(fileId)}/preview` +
    `?width=${width}&height=0&quality=${quality}&output=webp` +
    `&project=${encodeURIComponent(APPWRITE_PROJECT_ID)}`
  );
}

/** Foto de carro (`car-images`): grid 400/75, detalhe 1080/85. */
export function carImageUrl(fileId: string | null | undefined, size: "grid" | "full" = "grid"): string | null {
  if (!fileId) return null;
  return size === "full" ? previewUrl(BUCKET_CAR_IMAGES, fileId, 1080, 85) : previewUrl(BUCKET_CAR_IMAGES, fileId, 400, 75);
}

/** Logo de série (`series-logos`, 150×150 com transparência): 300/90. */
export function serieLogoUrl(fileId: string | null | undefined): string | null {
  return fileId ? previewUrl(BUCKET_SERIES_LOGOS, fileId, 300, 90) : null;
}

/** Logo de marca (`brand-logos`, mesmo formato do logo de série): 300/90. */
export function brandLogoUrl(fileId: string | null | undefined): string | null {
  return fileId ? previewUrl(BUCKET_BRAND_LOGOS, fileId, 300, 90) : null;
}
