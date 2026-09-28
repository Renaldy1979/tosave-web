"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { LoadMore } from "@/components/app/load-more";
import { SeriesRow } from "@/components/app/series-card";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { fieldClass } from "@/components/ui/input";
import { listSeries } from "@/lib/app-catalog";
import type { Serie } from "@/lib/app-types";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useInfiniteList } from "@/lib/use-infinite-list";

const PAGE_SIZE = 30;

function SeriesRowSkeleton() {
  return <div className="skeleton h-[72px] rounded-lg" />;
}

export function SeriesView() {
  const [term, setTerm] = useState("");
  const search = useDebouncedValue(term.trim(), 300);

  const { items, extra: total, state, hasMore, loadingMore, moreError, loadMore, reload } = useInfiniteList<Serie, number>(
    search,
    (cursor, signal) =>
      listSeries({ q: search, cursor, limit: PAGE_SIZE }, signal).then((page) => ({ items: page.items, nextCursor: page.nextCursor, extra: page.total ?? undefined }))
  );

  const searching = search.length > 0;

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
      {state === "ok" && total !== undefined ? (
        <p className="mt-3 text-body-sm text-fg-subtle">
          {total} {total === 1 ? "série" : "séries"}
        </p>
      ) : null}

      <div className="mt-4 lg:mt-6">
        {state === "loading" ? (
          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-3">
            {Array.from({ length: 8 }, (_, i) => (
              <SeriesRowSkeleton key={i} />
            ))}
          </div>
        ) : state === "error" ? (
          <ErrorState onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState kind="no-content" description={searching ? "Tente outro nome." : undefined} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-3">
              {items.map((serie) => (
                <SeriesRow
                  key={serie.id}
                  id={serie.id}
                  title={serie.title}
                  imageFileId={serie.imageFileId}
                  carCount={serie.carCount}
                  ownedCount={serie.owned}
                  featured={serie.isDefault}
                />
              ))}
            </div>
            <LoadMore hasMore={hasMore} loading={loadingMore} error={moreError} onLoadMore={loadMore} />
          </>
        )}
      </div>
    </div>
  );
}
