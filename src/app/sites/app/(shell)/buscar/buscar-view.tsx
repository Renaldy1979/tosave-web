"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CarCard, CarGridSkeleton } from "@/components/app/car-card";
import { FiltersPanel } from "@/components/app/filters-panel";
import { LoadMore } from "@/components/app/load-more";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { fieldClass } from "@/components/ui/input";
import { listAllSeries, listBrands, listAttributes, listCars, listYears, type CarFilters } from "@/lib/app-catalog";
import { useCollectionMutations } from "@/lib/collection-summary";
import type { Attribute, Brand, Serie } from "@/lib/app-types";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useInfiniteList } from "@/lib/use-infinite-list";

const EMPTY_FILTERS: CarFilters = { q: "", years: [], serieId: null, brandId: null, attributeIds: [] };
const PAGE_SIZE = 20;

type Options = { series: Serie[]; brands: Brand[]; attributes: Attribute[]; years: number[] };

function activeChips(filters: CarFilters, options: Options, onRemove: (next: CarFilters) => void) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.serieId) {
    const title = options.series.find((s) => s.id === filters.serieId)?.title ?? "—";
    chips.push({ key: "serie", label: `Série: ${title}`, onRemove: () => onRemove({ ...filters, serieId: null }) });
  }
  if (filters.brandId) {
    const name = options.brands.find((b) => b.id === filters.brandId)?.name ?? "—";
    chips.push({ key: "brand", label: `Marca: ${name}`, onRemove: () => onRemove({ ...filters, brandId: null }) });
  }
  (filters.years ?? []).forEach((year) =>
    chips.push({ key: `year-${year}`, label: `Ano: ${year}`, onRemove: () => onRemove({ ...filters, years: (filters.years ?? []).filter((y) => y !== year) }) })
  );
  if (filters.attributeIds && filters.attributeIds.length > 0) {
    chips.push({ key: "attr", label: `Atributos · ${filters.attributeIds.length}`, onRemove: () => onRemove({ ...filters, attributeIds: [] }) });
  }
  return chips;
}

function hasActiveFilter(filters: CarFilters): boolean {
  return Boolean(filters.q?.trim() || filters.years?.length || filters.serieId || filters.brandId || filters.attributeIds?.length);
}

export function BuscarView() {
  const [filters, setFilters] = useState<CarFilters>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toggle } = useCollectionMutations();
  const search = useDebouncedValue(filters.q ?? "", 300);

  const [options, setOptions] = useState<Options>({ series: [], brands: [], attributes: [], years: [] });
  useEffect(() => {
    Promise.all([listAllSeries(), listBrands(), listAttributes(), listYears()])
      .then(([series, brands, attributes, years]) => setOptions({ series, brands, attributes, years }))
      .catch(() => undefined);
  }, []);

  const filterKey = JSON.stringify({ ...filters, q: search });
  const { items: results, setItems: setResults, state, hasMore, loadingMore, moreError, loadMore, reload } = useInfiniteList(
    filterKey,
    (cursor, signal) => listCars({ ...filters, q: search }, cursor, PAGE_SIZE, signal).then((page) => ({ items: page.items, nextCursor: page.nextCursor }))
  );

  const chips = useMemo(() => activeChips(filters, options, setFilters), [filters, options]);
  const activeCount = (filters.years?.length ?? 0) + (filters.serieId ? 1 : 0) + (filters.brandId ? 1 : 0) + (filters.attributeIds?.length ?? 0);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">Buscar</h1>

      <div className="mt-4 flex items-center gap-2 lg:mt-6 lg:hidden">
        <div className="relative flex-1">
          <SearchIcon size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            type="search"
            aria-label="Buscar por nome ou código"
            placeholder="Buscar por nome ou código"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className={`${fieldClass} pl-10`}
          />
        </div>
        <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
          <Dialog.Trigger asChild>
            <Button variant="outline" size="icon" aria-label="Abrir filtros" className="relative shrink-0">
              <SlidersHorizontal size={18} strokeWidth={1.75} />
              {activeCount > 0 ? (
                <Badge variant="primary" size="sm" className="absolute -top-1.5 -right-1.5 min-w-4 justify-center px-1">
                  {activeCount}
                </Badge>
              ) : null}
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-60 animate-fade-in bg-overlay/70 backdrop-blur-sm" />
            <Dialog.Content className="fixed inset-x-0 bottom-0 z-60 max-h-[85dvh] overflow-y-auto rounded-t-xl border border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-modal focus:outline-none">
              <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface px-5 py-4">
                <Dialog.Title className="text-h3 text-fg">Filtros</Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Fechar"
                    className="flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-surface-3 hover:text-fg"
                  >
                    <X size={20} strokeWidth={1.75} />
                  </button>
                </Dialog.Close>
              </div>
              <div className="px-5 py-5">
                <FiltersPanel filters={filters} onChange={setFilters} series={options.series} brands={options.brands} years={options.years} attributes={options.attributes} />
              </div>
              <div className="sticky bottom-0 border-t border-border bg-surface p-4">
                <Button fullWidth onClick={() => setSheetOpen(false)}>
                  Ver resultados
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {chips.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 lg:hidden">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="flex h-8 items-center gap-1 rounded-md border border-primary/60 bg-primary-soft px-2.5 text-body-sm text-primary-text"
            >
              {chip.label}
              <X size={14} strokeWidth={2} aria-hidden />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:mt-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-6">
            <div className="relative">
              <SearchIcon size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle" aria-hidden />
              <input
                type="search"
                aria-label="Buscar por nome ou código"
                placeholder="Buscar por nome ou código"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                className={`${fieldClass} pl-10`}
              />
            </div>
            <FiltersPanel filters={filters} onChange={setFilters} series={options.series} brands={options.brands} years={options.years} attributes={options.attributes} />
          </div>
        </aside>

        <div>
          {state === "ok" ? (
            <p className="mb-4 text-body-sm text-fg-subtle">
              {results.length} {results.length === 1 ? "miniatura" : "miniaturas"}
            </p>
          ) : null}
          {state === "loading" ? (
            <CarGridSkeleton />
          ) : state === "error" ? (
            <ErrorState onRetry={reload} />
          ) : results.length === 0 ? (
            <EmptyState
              kind="no-cars"
              description="Tente outro termo ou limpe os filtros."
              action={
                hasActiveFilter(filters) ? (
                  <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>
                    Limpar filtros
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
                {results.map((car, i) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    priority={i < 4}
                    isFavorite={car.quantity > 0}
                    onToggleFavorite={() =>
                      toggle(car.id, car.quantity, (q) => setResults((prev) => prev.map((c) => (c.id === car.id ? { ...c, quantity: q, owned: q > 0 } : c))))
                    }
                  />
                ))}
              </div>
              <LoadMore hasMore={hasMore} loading={loadingMore} error={moreError} onLoadMore={loadMore} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
