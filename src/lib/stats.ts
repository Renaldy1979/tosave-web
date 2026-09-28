"use client";

import { api } from "./api";
import type { SerieStats, StatsSummary, YearStats } from "./app-types";

/** Estatísticas — rotas `/v2/stats/*` (`backendToSave/docs/API-V2.md`). */

export function getStatsSummary(signal?: AbortSignal): Promise<StatsSummary> {
  return api<StatsSummary>("/v2/stats/summary", { signal });
}

export function getSeriesStats(sort: "pct" | "name" = "pct", signal?: AbortSignal): Promise<SerieStats[]> {
  return api<SerieStats[]>("/v2/stats/series", { query: { sort }, signal });
}

export function getYearsStats(signal?: AbortSignal): Promise<YearStats[]> {
  return api<YearStats[]>("/v2/stats/years", { signal });
}
