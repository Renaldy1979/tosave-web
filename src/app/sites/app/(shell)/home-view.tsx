"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CarCard, CarGridSkeleton } from "@/components/app/car-card";
import { LoadMore } from "@/components/app/load-more";
import { SeriesCard } from "@/components/app/series-card";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { useMe } from "@/lib/auth";
import { listAllFeaturedSeries, listCars } from "@/lib/app-catalog";
import { useCollectionMutations, useCollectionSummary } from "@/lib/collection-summary";
import type { Serie } from "@/lib/app-types";
import { useInfiniteList } from "@/lib/use-infinite-list";

const CARS_PAGE_SIZE = 20;

function SeriesRailSkeleton() {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="skeleton h-40 w-[280px] shrink-0 rounded-lg" />
      ))}
    </div>
  );
}

export function HomeView() {
  const me = useMe();
  const { summary } = useCollectionSummary();
  const { toggle } = useCollectionMutations();
  const firstName = me.name.trim().split(/\s+/)[0] || "";

  const [series, setSeries] = useState<Serie[]>([]);
  const [seriesState, setSeriesState] = useState<"loading" | "ok" | "error">("loading");

  const loadSeries = () => {
    setSeriesState("loading");
    listAllFeaturedSeries()
      .then((items) => {
        setSeries(items);
        setSeriesState("ok");
      })
      .catch(() => setSeriesState("error"));
  };
  useEffect(loadSeries, []);

  const {
    items: cars,
    setItems: setCars,
    state: carsState,
    hasMore,
    loadingMore,
    moreError,
    loadMore,
    reload: reloadCars,
  } = useInfiniteList(
    "home-cars",
    (cursor, signal) => listCars({}, cursor, CARS_PAGE_SIZE, signal).then((page) => ({ items: page.items, nextCursor: page.nextCursor }))
  );

  const featuredSeries = useMemo(() => series, [series]);

  return (
    <div>
      <div className="ink relative overflow-hidden px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:pt-10">
        <span aria-hidden className="absolute inset-0 bg-hero-glow" />
        <div className="relative mx-auto max-w-[1440px]">
          <p className="text-body-sm text-ink-fg/60">Olá, {firstName}</p>
          <h1 className="mt-0.5 font-display text-h1 text-fg italic lg:text-display-lg">O que vamos garimpar hoje?</h1>

          <Link
            href="/buscar"
            className="mt-4 flex h-13 items-center gap-2.5 rounded-md border border-white/10 bg-white/5 px-3.5 text-body text-fg-subtle backdrop-blur transition duration-fast hover:border-white/20 hover:bg-white/10 lg:max-w-md"
          >
            <Search size={18} strokeWidth={1.75} aria-hidden />
            Buscar por nome ou código
          </Link>

          {seriesState !== "ok" || featuredSeries.length > 0 ? (
            <div className="mt-8 min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-condensed text-eyebrow text-ink-fg/60 uppercase">Séries em destaque</p>
                <Link href="/series" className="text-body-sm font-medium text-primary-text hover:underline">
                  Ver tudo
                </Link>
              </div>
              {seriesState === "loading" ? (
                <SeriesRailSkeleton />
              ) : seriesState === "error" ? (
                <ErrorState compact onRetry={loadSeries} />
              ) : (
                <div className="-mx-4 flex min-w-0 gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" style={{ scrollSnapType: "x mandatory" }}>
                  {featuredSeries.map((serie) => (
                    <div key={serie.id} style={{ scrollSnapAlign: "start" }}>
                      <SeriesCard id={serie.id} title={serie.title} description={serie.description} carCount={serie.carCount} ownedCount={serie.owned} featured />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-5 md:px-6 lg:px-8 lg:py-8">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="font-condensed text-eyebrow text-fg-subtle uppercase">Miniaturas</p>
          <p className="text-body-sm text-fg-subtle">{summary.totalModels} na sua coleção</p>
        </div>

        {carsState === "loading" ? (
          <CarGridSkeleton />
        ) : carsState === "error" ? (
          <ErrorState onRetry={reloadCars} />
        ) : cars.length === 0 ? (
          <EmptyState kind="no-cars" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
              {cars.map((car, i) => (
                <CarCard
                  key={car.id}
                  car={car}
                  priority={i < 4}
                  isFavorite={car.quantity > 0}
                  onToggleFavorite={() =>
                    toggle(car.id, car.quantity, (q) => setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, quantity: q, owned: q > 0 } : c))))
                  }
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
