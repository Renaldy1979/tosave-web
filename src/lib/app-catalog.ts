"use client";

import { api } from "./api";
import type { Attribute, Brand, CarDetail, OwnedCar, Page, Serie } from "./app-types";

/** Catálogo do app do colecionador — rotas `/v2/*` (`backendToSave/docs/API-V2.md`). */

export type CarFilters = {
  q?: string;
  years?: number[];
  serieId?: string | null;
  brandId?: string | null;
  attributeIds?: string[];
};

function carQuery(filters: CarFilters) {
  return {
    q: filters.q?.trim() || undefined,
    years: filters.years && filters.years.length > 0 ? filters.years : undefined,
    serieId: filters.serieId || undefined,
    brandId: filters.brandId || undefined,
    attributeIds: filters.attributeIds && filters.attributeIds.length > 0 ? filters.attributeIds : undefined,
  };
}

export function listCars(filters: CarFilters, cursor: string | null, limit: number, signal?: AbortSignal) {
  return api<Page<OwnedCar>>("/v2/cars", { query: { ...carQuery(filters), cursor, limit }, signal });
}

export function getCarById(id: string, signal?: AbortSignal): Promise<CarDetail> {
  return api<CarDetail>(`/v2/cars/${encodeURIComponent(id)}`, { signal });
}

export function listYears(signal?: AbortSignal): Promise<number[]> {
  return api<number[]>("/v2/cars/years", { signal });
}

export function listBrands(signal?: AbortSignal): Promise<Brand[]> {
  return api<Brand[]>("/v2/brands", { signal });
}

export function listAttributes(signal?: AbortSignal): Promise<Attribute[]> {
  return api<Attribute[]>("/v2/attributes", { signal });
}

export function listSeries(query: { q?: string; featured?: boolean; cursor?: string | null; limit?: number }, signal?: AbortSignal) {
  return api<Page<Serie>>("/v2/series", {
    query: { q: query.q?.trim() || undefined, featured: query.featured || undefined, cursor: query.cursor, limit: query.limit ?? 30 },
    signal,
  });
}

/** Todas as páginas de `/v2/series` (destaques da Home: poucas, cabe numa chamada). */
export async function listAllFeaturedSeries(signal?: AbortSignal): Promise<Serie[]> {
  const page = await listSeries({ featured: true, limit: 100 }, signal);
  return page.items;
}

/** Todas as séries A–Z, para o filtro de Buscar (algumas centenas: cabe em memória). */
export async function listAllSeries(signal?: AbortSignal): Promise<Serie[]> {
  const out: Serie[] = [];
  let cursor: string | null = null;
  do {
    const page = await listSeries({ cursor, limit: 100 }, signal);
    out.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);
  return out;
}

export function getSerie(id: string, signal?: AbortSignal): Promise<Serie> {
  return api<Serie>(`/v2/series/${encodeURIComponent(id)}`, { signal });
}

export type SerieCarsFilter = "all" | "owned" | "missing";

export function getSerieCars(
  serieId: string,
  filter: SerieCarsFilter,
  cursor: string | null,
  limit: number,
  signal?: AbortSignal
): Promise<{ items: OwnedCar[]; counts: { total: number; owned: number; missing: number }; nextCursor: string | null }> {
  return api(`/v2/series/${encodeURIComponent(serieId)}/cars`, { query: { filter, cursor, limit }, signal });
}

/** "Mais da série" no detalhe do carro: até `limit` carros, excluindo o atual. */
export async function listRelatedInSerie(serieId: string, excludeId: string, limit: number, signal?: AbortSignal): Promise<OwnedCar[]> {
  const page = await getSerieCars(serieId, "all", null, limit + 1, signal);
  return page.items.filter((c) => c.id !== excludeId).slice(0, limit);
}
