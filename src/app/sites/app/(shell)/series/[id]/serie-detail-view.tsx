"use client";

import { useEffect, useState } from "react";
import { CarCard, CarGridSkeleton } from "@/components/app/car-card";
import { LoadMore } from "@/components/app/load-more";
import { SerieLogo } from "@/components/app/serie-logo";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { SegmentedControl } from "@/components/ui/segmented";
import { ApiError } from "@/lib/api";
import { getSerie, getSerieCars, type SerieCarsFilter } from "@/lib/app-catalog";
import type { Serie } from "@/lib/app-types";
import { useCollectionMutations } from "@/lib/collection-summary";
import { useInfiniteList } from "@/lib/use-infinite-list";

type Filtro = "todos" | "colecao" | "faltam";
const FILTER_API: Record<Filtro, SerieCarsFilter> = { todos: "all", colecao: "owned", faltam: "missing" };
const PAGE_SIZE = 20;

type Counts = { total: number; owned: number; missing: number };
const ZERO_COUNTS: Counts = { total: 0, owned: 0, missing: 0 };

export function SerieDetailView({ id }: { id: string }) {
  const { toggle } = useCollectionMutations();
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const [serie, setSerie] = useState<Serie | null>(null);
  const [serieState, setSerieState] = useState<"loading" | "ok" | "not-found" | "error">("loading");

  const loadSerie = () => {
    setSerieState("loading");
    getSerie(id)
      .then((s) => {
        setSerie(s);
        setSerieState("ok");
      })
      .catch((err) => setSerieState(err instanceof ApiError && err.status === 404 ? "not-found" : "error"));
  };
  useEffect(loadSerie, [id]);

  const {
    items: cars,
    setItems: setCars,
    extra: counts,
    state: listState,
    hasMore,
    loadingMore,
    moreError,
    loadMore,
    reload: reloadCars,
  } = useInfiniteList(`${id}:${filtro}`, (cursor, signal) =>
    getSerieCars(id, FILTER_API[filtro], cursor, PAGE_SIZE, signal).then((page) => ({ items: page.items, nextCursor: page.nextCursor, extra: page.counts }))
  );

  // As contagens do cabeçalho vêm do servidor a cada página; os toques do
  // usuário ajustam por cima na hora, sem esperar recarregar (mesma ideia
  // do resumo global da tela Coleção, atualizado a cada mutação).
  const [localCounts, setLocalCounts] = useState<Counts>(ZERO_COUNTS);
  useEffect(() => {
    if (counts) setLocalCounts(counts);
  }, [counts]);

  const handleToggle = (carId: string, quantity: number) => {
    const wasOwned = quantity > 0;
    toggle(carId, quantity, (q) => {
      setCars((prev) => prev.map((c) => (c.id === carId ? { ...c, quantity: q, owned: q > 0 } : c)));
      const nowOwned = q > 0;
      if (wasOwned !== nowOwned) {
        setLocalCounts((c) => ({ total: c.total, owned: c.owned + (nowOwned ? 1 : -1), missing: c.missing + (nowOwned ? -1 : 1) }));
      }
    });
  };

  if (serieState === "not-found") {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
        <EmptyState kind="no-content" action={<ButtonLink href="/series">Ver todas as séries</ButtonLink>} />
      </div>
    );
  }

  if (serieState === "error") {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
        <ErrorState onRetry={loadSerie} />
      </div>
    );
  }

  if (serieState === "loading" || !serie) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="skeleton size-24 rounded-full" />
          <div className="skeleton h-7 w-48" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="mt-6">
          <CarGridSkeleton />
        </div>
      </div>
    );
  }

  const { total, owned, missing } = localCounts;
  const complete = total > 0 && owned === total;
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

  const empty =
    filtro === "colecao" ? (
      <EmptyState kind="no-cars" description="Você ainda não tem miniaturas desta série." action={<ButtonLink href="/buscar">Explorar miniaturas</ButtonLink>} />
    ) : filtro === "faltam" ? (
      <EmptyState kind="no-cars" description="Você tem todas as miniaturas desta série." />
    ) : (
      <EmptyState kind="no-cars" />
    );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <SerieLogo fileId={serie.imageFileId} alt="" className="size-24 rounded-full" />
        <h1 className="font-display text-h1 text-fg">{serie.title}</h1>
        {serie.description ? <p className="max-w-md text-body-sm text-fg-muted">{serie.description}</p> : null}

        {total > 0 ? (
          <div className="mt-2 w-full max-w-sm">
            <p className="text-center text-body text-fg-muted">
              {complete ? (
                <>
                  Você tem todas as <span className="font-display font-extrabold text-accent">{total}</span>
                </>
              ) : (
                <>
                  Você tem <span className="font-display font-extrabold text-accent">{owned}</span> de {total}
                </>
              )}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-flame transition-all duration-slow" style={{ width: `${percent}%` }} />
              </div>
              <span className="text-caption text-fg-subtle">{percent}%</span>
            </div>
            {complete ? (
              <div className="mt-2 flex justify-center">
                <Badge variant="accent" size="sm">
                  Série completa
                </Badge>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {total > 0 ? (
        <div className="mt-6 flex justify-center">
          <SegmentedControl
            value={filtro}
            onChange={setFiltro}
            options={[
              { value: "todos", label: `Todos ${total}` },
              { value: "colecao", label: `Na coleção ${owned}` },
              { value: "faltam", label: `Faltam ${missing}` },
            ]}
          />
        </div>
      ) : null}

      <div className="mt-6 lg:mt-8">
        {listState === "loading" ? (
          <CarGridSkeleton />
        ) : listState === "error" ? (
          <ErrorState onRetry={reloadCars} />
        ) : cars.length === 0 ? (
          empty
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} isFavorite={car.quantity > 0} onToggleFavorite={() => handleToggle(car.id, car.quantity)} />
              ))}
            </div>
            <LoadMore hasMore={hasMore} loading={loadingMore} error={moreError} onLoadMore={loadMore} />
          </>
        )}
      </div>
    </div>
  );
}
