/**
 * Endereços públicos (vão no bundle do navegador). O Next só injeta
 * `process.env.NEXT_PUBLIC_*` com acesso literal, no build.
 */
const trim = (url: string) => url.replace(/\/+$/, "");

export const API_URL = trim(process.env.NEXT_PUBLIC_API_URL || "https://api.tosave.cloud");

export const APPWRITE_ENDPOINT = trim(
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://tosave-appwrite.8m5sgi.easypanel.host/v1"
);

export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6aa1d3ab0039a9a9a8c4";

export const BUCKET_CAR_IMAGES = "car-images";
export const BUCKET_SERIES_LOGOS = "series-logos";
export const BUCKET_BRAND_LOGOS = "brand-logos";
export const BUCKET_NEWS_IMAGES = "news-images";

/** Endereço do app web para colecionadores (login, cadastro). */
export const APP_URL = trim(process.env.NEXT_PUBLIC_APP_URL || "https://app.tosave.cloud");

/** Endereço do site institucional (link "Voltar ao site"). */
export const SITE_URL = trim(process.env.NEXT_PUBLIC_SITE_URL || "https://tosave.cloud");
