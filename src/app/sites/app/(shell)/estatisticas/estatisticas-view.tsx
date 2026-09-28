"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProgressRow } from "@/components/app/progress-row";
import { StatTile } from "@/components/app/stat-tile";
import { ErrorState } from "@/components/ui/feedback";
import { SegmentedControl } from "@/components/ui/segmented";
import type { SerieStats, StatsSummary, YearStats } from "@/lib/app-types";
import { getSeriesStats, getStatsSummary, getYearsStats } from "@/lib/stats";

type SortMode = "pct" | "name";
type Section<T> = { state: "loading" | "ok" | "error"; data: T };

function catalogShare(models: number, total: number): string {
  if (models <= 0 || total <= 0) return "0%";
  const pct = (models / total) * 100;
  if (pct < 0.1) return "< 0,1%";
  return `${pct.toFixed(1).replace(".", ",")}%`;
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface p-3 sm:max-w-md">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton h-14 rounded-md" />
      ))}
    </div>
  );
}

function RowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2 border-b border-border px-3.5 py-3 last:border-b-0">
          <div className="skeleton h-3.5 w-2/5" />
          <div className="skeleton h-1.5 w-full" />
        </div>
      ))}
    </div>
  );
}

export function EstatisticasView() {
  const [summary, setSummary] = useState<Section<StatsSummary | null>>({ state: "loading", data: null });
  const [series, setSeries] = useState<Section<SerieStats[]>>({ state: "loading", data: [] });
  const [years, setYears] = useState<Section<YearStats[]>>({ state: "loading", data: [] });
  const [sort, setSort] = useState<SortMode>("pct");

  useEffect(() => {
    setSummary({ state: "loading", data: null });
    getStatsSummary()
      .then((data) => setSummary({ state: "ok", data }))
      .catch(() => setSummary({ state: "error", data: null }));
  }, []);

  useEffect(() => {
    setSeries({ state: "loading", data: [] });
    getSeriesStats()
      .then((data) => setSeries({ state: "ok", data }))
      .catch(() => setSeries({ state: "error", data: [] }));
  }, []);

  useEffect(() => {
    setYears({ state: "loading", data: [] });
    getYearsStats()
      .then((data) => setYears({ state: "ok", data }))
      .catch(() => setYears({ state: "error", data: [] }));
  }, []);

  const sortedSeries = useMemo(() => {
    const list = [...series.data];
    if (sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
    else list.sort((a, b) => b.pct - a.pct || b.owned - a.owned || a.title.localeCompare(b.title));
    return list;
  }, [series.data, sort]);

  const emptyCollection = summary.state === "ok" && (summary.data?.totalModels ?? 0) === 0;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">Estatísticas</h1>

      <div className="mt-5 lg:mt-6">
        {summary.state === "loading" ? (
          <SummarySkeleton />
        ) : summary.state === "error" ? (
          <ErrorState compact />
        ) : summary.data ? (
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface p-3 sm:max-w-md sm:grid-cols-4">
            <StatTile value={summary.data.totalItems} label="Unidades" />
            <StatTile value={summary.data.totalModels} label="Modelos" />
            <StatTile value={summary.data.duplicates} label="Repetidos" href="/colecao" />
            <div className="flex flex-1 flex-col items-center gap-0.5 py-1 text-center">
              <span className="font-display text-display-lg font-extrabold text-fg italic tabular-nums">
                {catalogShare(summary.data.totalModels, summary.data.catalogTotal)}
              </span>
              <span className="text-caption text-fg-muted">Do catálogo</span>
            </div>
          </div>
        ) : null}
      </div>

      {emptyCollection ? (
        <div className="mt-8">
          <p className="text-body-sm text-fg-muted">Adicione miniaturas à sua coleção para ver seu progresso.</p>
        </div>
      ) : (
        <>
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h2 text-fg">Progresso por série</h2>
              {series.state === "ok" && sortedSeries.length > 0 ? (
                <SegmentedControl
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: "pct", label: "Maior %" },
                    { value: "name", label: "Nome" },
                  ]}
                />
              ) : null}
            </div>
            {series.state === "loading" ? (
              <RowsSkeleton />
            ) : series.state === "error" ? (
              <ErrorState compact />
            ) : sortedSeries.length === 0 ? (
              <p className="text-body-sm text-fg-muted">Nenhuma série iniciada ainda.</p>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  {sortedSeries.map((s) => (
                    <ProgressRow key={s.serieId} href={`/series/${s.serieId}?filtro=faltam`} title={s.title} owned={s.owned} total={s.carCount} imageFileId={s.imageFileId} />
                  ))}
                </div>
                <div className="mt-2 flex justify-end">
                  <Link href="/series" className="inline-flex items-center gap-1 text-body-sm font-medium text-primary-text hover:underline">
                    Ver todas as séries
                    <ChevronRight size={16} strokeWidth={1.75} aria-hidden />
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-h2 text-fg">Por ano</h2>
            {years.state === "loading" ? (
              <RowsSkeleton />
            ) : years.state === "error" ? (
              <ErrorState compact />
            ) : years.data.length === 0 ? (
              <p className="text-body-sm text-fg-muted">Nenhum ano com miniaturas ainda.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border bg-surface">
                {years.data.map((y) => (
                  <ProgressRow key={y.year} href={`/buscar?year=${y.year}`} title={String(y.year)} owned={y.owned} total={y.carCount} titleIsYear />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
