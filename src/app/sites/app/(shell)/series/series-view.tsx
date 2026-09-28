"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SeriesRow } from "@/components/app/series-card";
import { EmptyState } from "@/components/ui/feedback";
import { fieldClass } from "@/components/ui/input";
import { MOCK_SERIES, carCountBySerie, ownedCountBySerie } from "../../_mock/data";
import { useCollectionStore } from "../../_mock/collection-store";

const SORTED_SERIES = [...MOCK_SERIES].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

export function SeriesView() {
  const collection = useCollectionStore();
  const [term, setTerm] = useState("");

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    return q ? SORTED_SERIES.filter((s) => s.title.toLowerCase().includes(q)) : SORTED_SERIES;
  }, [term]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">Séries</h1>

      <div className="relative mt-4 max-w-sm lg:mt-6">
        <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle" aria-hidden />
        <input
          type="search"
          aria-label="Buscar série"
          placeholder="Buscar série"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className={`${fieldClass} pl-10`}
        />
      </div>
      <p className="mt-3 text-body-sm text-fg-subtle">
        {results.length} {results.length === 1 ? "série" : "séries"}
      </p>

      <div className="mt-4 lg:mt-6">
        {results.length === 0 ? (
          <EmptyState kind="no-content" description="Tente outro nome." />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-3">
            {results.map((serie) => (
              <SeriesRow
                key={serie.id}
                id={serie.id}
                title={serie.title}
                carCount={carCountBySerie(serie.id)}
                ownedCount={ownedCountBySerie(serie.id, collection.quantities)}
                featured={serie.isDefault}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
