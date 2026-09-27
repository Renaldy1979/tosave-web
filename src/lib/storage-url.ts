import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, BUCKET_BRAND_LOGOS, BUCKET_CAR_IMAGES, BUCKET_NEWS_IMAGES, BUCKET_SERIES_LOGOS } from "./env";

/**
 * URLs de preview do Storage do Appwrite. Módulo neutro (sem "use client"):
 * usado tanto no servidor (site: home, detalhe, metadata) quanto no navegador.
 */
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

/** Imagem de notícia (`news-images`, 16:9): card 640/75, detalhe 1280/85. */
export function newsImageUrl(fileId: string | null | undefined, size: "grid" | "full" = "grid"): string | null {
  if (!fileId) return null;
  return size === "full" ? previewUrl(BUCKET_NEWS_IMAGES, fileId, 1280, 85) : previewUrl(BUCKET_NEWS_IMAGES, fileId, 640, 75);
}
