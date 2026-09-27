"use client";

import { useState } from "react";
import { CarCard } from "@/components/site/car-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { APP_URL } from "@/lib/env";
import { loadShowcase, type CarItem, type Page } from "@/lib/public-api";

const nf = new Intl.NumberFormat("pt-BR");
const LIMIT = 24;
const MAX_ITEMS = 48;

function SkeletonGrid() {
  return (
    <ul role="list" aria-busy="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5 lg:gap-6">
      {Array.from({ length: 12 }, (_, i) => (
        <li key={i}>
          <Skeleton className="aspect-card rounded-t-lg" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1.5 h-3.5 w-1/2" />
        </li>
      ))}
    </ul>
  );
}

function CarGrid({ items }: { items: CarItem[] }) {
  return (
    <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5 lg:gap-6">
      {items.map((car, i) => (
        <li key={car.id}>
          <CarCard car={car} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}

/** Chamada forte no meio da grade: o site é um gatilho para o cadastro, não um lugar para navegar muito. */
function MidBanner() {
  return (
    <div className="my-8 flex flex-col items-center gap-3 rounded-lg border border-primary/30 bg-primary-soft px-5 py-6 text-center sm:my-10">
      <p className="font-display text-h3 text-fg italic">Curtiu essas miniaturas?</p>
      <p className="max-w-sm text-body-sm text-fg-muted">Crie sua conta e monte a sua própria garagem também.</p>
      <ButtonLink href={`${APP_URL}/cadastro`} variant="flame">
        Criar minha coleção
      </ButtonLink>
    </div>
  );
}

function EndBanner({ totalCars }: { totalCars: number | null }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3 rounded-lg bg-surface px-5 py-8 text-center shadow-card sm:mt-10">
      <p className="font-display text-h2 text-fg italic">Isso é só uma amostra.</p>
      <p className="max-w-md text-body text-fg-muted">
        {totalCars !== null
          ? `A comunidade ToSave tem ${nf.format(totalCars)} miniaturas. Cadastre-se para ver a coleção completa e começar a sua.`
          : "Cadastre-se para ver a coleção completa da comunidade e começar a sua."}
      </p>
      <ButtonLink href={`${APP_URL}/cadastro`} variant="flame" size="lg">
        Ver a coleção completa na comunidade
      </ButtonLink>
    </div>
  );
}

export function VitrineView({ totalCars, initialPage }: { totalCars: number | null; initialPage: Page<CarItem> | null }) {
  const [items, setItems] = useState<CarItem[]>(initialPage?.items ?? []);
  const [cursor, setCursor] = useState<string | null>(initialPage?.nextCursor ?? null);
  const [loadError, setLoadError] = useState(initialPage === null);
  const [reloading, setReloading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);

  async function retryInitial() {
    setReloading(true);
    setLoadError(false);
    try {
      const page = await loadShowcase({ limit: LIMIT });
      setItems(page.items);
      setCursor(page.nextCursor);
    } catch {
      setLoadError(true);
    } finally {
      setReloading(false);
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    setMoreError(false);
    try {
      const page = await loadShowcase({ cursor, limit: LIMIT });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    } catch {
      setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  const canLoadMore = cursor !== null && items.length < MAX_ITEMS;
  const firstBatch = items.slice(0, LIMIT);
  const restBatch = items.slice(LIMIT);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-5 md:px-6 lg:px-8 lg:py-12">
      <h1 className="font-display text-h1 text-fg italic">Vitrine</h1>
      <p className="mt-1 text-body text-fg-muted">Os destaques da comunidade ToSave.</p>

      <div className="mt-8">
        {loadError ? (
          <ErrorState onRetry={() => void retryInitial()} message="Não foi possível carregar a vitrine agora." />
        ) : reloading ? (
          <SkeletonGrid />
        ) : items.length === 0 ? (
          <EmptyState kind="no-cars" />
        ) : (
          <>
            <CarGrid items={firstBatch} />
            <MidBanner />
            {restBatch.length ? <CarGrid items={restBatch} /> : null}

            {canLoadMore ? (
              <div className="mt-8 flex flex-col items-center gap-3">
                <Button variant="outline" onClick={() => void loadMore()} loading={loadingMore}>
                  Carregar mais
                </Button>
                {moreError ? <p className="text-caption text-danger">Não foi possível carregar mais. Tente de novo.</p> : null}
              </div>
            ) : (
              <EndBanner totalCars={totalCars} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
