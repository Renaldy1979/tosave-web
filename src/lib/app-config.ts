"use client";

import { loadPublicConfig, type PublicConfig } from "./public-api";
import { useApi } from "./use-api";

/** Config pública (`GET /v2/config`) para a seção "Ajuda e informações" (Mais, sidebar). */
export function useAppConfig() {
  return useApi<PublicConfig>("app-config", (signal) => loadPublicConfig({ signal }));
}
