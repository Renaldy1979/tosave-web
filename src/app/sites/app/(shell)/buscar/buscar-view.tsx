"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CarCard } from "@/components/app/car-card";
import { FiltersPanel } from "@/components/app/filters-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { fieldClass } from "@/components/ui/input";
import { MOCK_BRANDS, MOCK_CARS, MOCK_SERIES } from "../../_mock/data";
import { useCollectionStore } from "../../_mock/collection-store";
import { EMPTY_FILTERS, filterCars, hasActiveFilter, type CarFilters } from "../../_mock/filter";

function activeChips(filters: CarFilters, onRemove: (next: CarFilters) => void) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.serieId) {
    const title = MOCK_SERIES.find((s) => s.id === filters.serieId)?.title ?? "—";
    chips.push({ key: "serie", label: `Série: ${title}`, onRemove: () => onRemove({ ...filters, serieId: null }) });
  }
  if (filters.brandId) {
    const name = MOCK_BRANDS.find((b) => b.id === filters.brandId)?.name ?? "—";
    chips.push({ key: "brand", label: `Marca: ${name}`, onRemove: () => onRemove({ ...filters, brandId: null }) });
  }
  filters.years.forEach((year) =>
    chips.push({ key: `year-${year}`, label: `Ano: ${year}`, onRemove: () => onRemove({ ...filters, years: filters.years.filter((y) => y !== year) }) })
  );
  if (filters.attributeIds.length) {
    chips.push({
      key: "attr",
      label: `Atributos · ${filters.attributeIds.length}`,
      onRemove: () => onRemove({ ...filters, attributeIds: [] }),
    });
  }
  return chips;
}

export function BuscarView() {
  const [filters, setFilters] = useState<CarFilters>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const collection = useCollectionStore();

  const results = useMemo(() => filterCars(MOCK_CARS, filters), [filters]);
  const chips = activeChips(filters, setFilters);
  const activeCount = filters.years.length + (filters.serieId ? 1 : 0) + (filters.brandId ? 1 : 0) + filters.attributeIds.length;

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
                <FiltersPanel filters={filters} onChange={setFilters} />
              </div>
              <div className="sticky bottom-0 border-t border-border bg-surface p-4">
                <Button fullWidth onClick={() => setSheetOpen(false)}>
                  Ver {results.length} {results.length === 1 ? "resultado" : "resultados"}
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
            <FiltersPanel filters={filters} onChange={setFilters} />
          </div>
        </aside>

        <div>
          <p className="mb-4 text-body-sm text-fg-subtle">
            {results.length} {results.length === 1 ? "miniatura" : "miniaturas"}
          </p>
          {results.length === 0 ? (
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
            <div className="grid grid-cols-2 gap-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
              {results.map((car, i) => (
                <CarCard
                  key={car.id}
                  car={car}
                  priority={i < 4}
                  isFavorite={collection.quantityOf(car.id) > 0}
                  onToggleFavorite={() => collection.toggle(car.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
