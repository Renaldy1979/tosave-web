"use client";

import { api } from "./api";
import type { NewsItem, Page } from "./app-types";

/** Notícias — rotas `/v2/news*` (`backendToSave/docs/API-V2.md`). Pública, mas chamada com JWT (ignorado pelo backend). */

export function listNews(query: { cursor?: string | null; limit?: number }, signal?: AbortSignal): Promise<Page<NewsItem>> {
  return api<Page<NewsItem>>("/v2/news", { query: { cursor: query.cursor, limit: query.limit ?? 20 }, signal });
}

export function getNewsById(id: string, signal?: AbortSignal): Promise<NewsItem> {
  return api<NewsItem>(`/v2/news/${encodeURIComponent(id)}`, { signal });
}
