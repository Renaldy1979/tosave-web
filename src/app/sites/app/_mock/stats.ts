/**
 * Estatísticas de exemplo (lote 5b fase A). Mesmo formato de `GET /v2/stats/*`
 * (`backendToSave/docs/API-V2.md`) — a fase B troca este arquivo por
 * `src/lib/stats.ts` chamando a API de verdade.
 */

import type { SerieStats, StatsSummary, YearStats } from "@/lib/app-types";

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const MOCK_SUMMARY: StatsSummary = {
  totalItems: 132,
  totalModels: 118,
  duplicates: 14,
  catalogTotal: 4210,
  catalogPct: 2.8,
};

const MOCK_SERIES_STATS: SerieStats[] = [
  { serieId: "serie-muscle", title: "Muscle Mania", imageFileId: null, owned: 10, carCount: 10, pct: 100, complete: true },
  { serieId: "serie-jdm", title: "JDM Legends", imageFileId: null, owned: 6, carCount: 8, pct: 75, complete: false },
  { serieId: "serie-super", title: "Super Sport", imageFileId: null, owned: 2, carCount: 5, pct: 40, complete: false },
  { serieId: "serie-rally", title: "Rally Legends", imageFileId: null, owned: 3, carCount: 10, pct: 30, complete: false },
  { serieId: "serie-baja", title: "Baja Blazers", imageFileId: null, owned: 1, carCount: 8, pct: 12.5, complete: false },
];

const MOCK_YEAR_STATS: YearStats[] = [
  { year: 2024, owned: 34, carCount: 120, pct: 28.3 },
  { year: 2023, owned: 28, carCount: 115, pct: 24.3 },
  { year: 2022, owned: 22, carCount: 110, pct: 20 },
  { year: 2021, owned: 18, carCount: 108, pct: 16.7 },
  { year: 2020, owned: 16, carCount: 102, pct: 15.7 },
];

export function getStatsSummaryMock(): Promise<StatsSummary> {
  return delay(MOCK_SUMMARY);
}

export function getSeriesStatsMock(sort: "pct" | "name" = "pct"): Promise<SerieStats[]> {
  const list = [...MOCK_SERIES_STATS];
  if (sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
  else list.sort((a, b) => b.pct - a.pct || b.owned - a.owned || a.title.localeCompare(b.title));
  return delay(list);
}

export function getYearsStatsMock(): Promise<YearStats[]> {
  return delay(MOCK_YEAR_STATS);
}
