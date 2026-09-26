"use client";

import type { AdminAttribute, AdminBrand, AdminSerie, Page } from "./admin-types";
import { api } from "./api";

/**
 * Listas pequenas usadas em filtros e formulários (marcas, atributos,
 * anos). Ficam em cache na sessão; `invalidateCatalog` limpa depois de
 * criar ou editar uma delas.
 */
const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  let hit = cache.get(key) as Promise<T> | undefined;
  if (!hit) {
    hit = load().catch((err: unknown) => {
      cache.delete(key);
      throw err;
    });
    cache.set(key, hit);
  }
  return hit;
}

export function invalidateCatalog(key?: "brands" | "attributes" | "years") {
  if (key) cache.delete(key);
  else cache.clear();
}

export const loadBrands = () => cached("brands", () => api<AdminBrand[]>("/admin/brands"));

export const loadAttributes = () => cached("attributes", () => api<AdminAttribute[]>("/admin/attributes"));

export const loadYears = () => cached("years", () => api<number[]>("/v2/cars/years"));

export const loadSerie = (id: string) => api<AdminSerie>(`/admin/series/${encodeURIComponent(id)}`);

export const searchSeries = (q: string, signal?: AbortSignal) =>
  api<Page<AdminSerie>>("/admin/series", { query: { q: q.trim() || undefined, limit: 30 }, signal });
