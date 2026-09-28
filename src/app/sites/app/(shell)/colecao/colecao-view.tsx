"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { CarCard, CarGridSkeleton } from "@/components/app/car-card";
import { LoadMore } from "@/components/app/load-more";
import { StatTile } from "@/components/app/stat-tile";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { fieldClass } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented";
import { getCollectionPage, setCollectionQuantity, type CollectionSort } from "@/lib/collection";
import { useCollectionSummary } from "@/lib/collection-summary";
import { errorMessage } from "@/lib/api";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useInfiniteList } from "@/lib/use-infinite-list";
import { toast } from "sonner";

const SORT_LABEL: Record<CollectionSort, string> = {
  recent: "Adicionados recentemente",
  name: "Nome A–Z",
  year: "Ano (mais novo)",
  quantity: "Mais unidades",
};

const PAGE_SIZE = 20;

export function ColecaoView() {
  const { summary, setSummary } = useCollectionSummary();
  const [term, setTerm] = useState("");
  const [onlyDuplicates, setOnlyDuplicates] = useState(false);
  const [sort, setSort] = useState<CollectionSort>("recent");
  const search = useDebouncedValue(term, 300);

  const key = JSON.stringify({ search, onlyDuplicates, sort });
  const { items, setItems, state, hasMore, loadingMore, moreError, loadMore, reload } = useInfiniteList(
    key,
    (cursor, signal) =>
      getCollectionPage({ q: search, duplicatesOnly: onlyDuplicates, sort, cursor, limit: PAGE_SIZE }, signal).then((page) => ({
        items: page.items,
        nextCursor: page.nextCursor,
      }))
  );

  const handleChangeQuantity = async (carId: string, next: number) => {
    try {
      const result = await setCollectionQuantity(carId, next);
      const quantity = result.item?.quantity ?? 0;
      setSummary(result.summary);
      setItems((prev) =>
        quantity <= 0 || (onlyDuplicates && quantity <= 1)
          ? prev.filter((it) => it.carId !== carId)
          : prev.map((it) => (it.carId === carId ? { ...it, quantity, car: { ...it.car, quantity, owned: true } } : it))
      );
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const hasCollection = summary.totalModels > 0;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">Minha coleção</h1>

      {hasCollection ? (
        <div className="mt-4 flex rounded-lg border border-border bg-surface p-3 lg:mt-6 lg:max-w-md">
          <StatTile value={summary.totalItems} label="Itens" />
          <StatTile value={summary.totalModels} label="Modelos" />
          <StatTile value={summary.duplicates} label="Repetidos" />
        </div>
      ) : null}

      {hasCollection ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-6">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <input
              type="search"
              aria-label="Buscar na coleção"
              placeholder="Buscar na coleção"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className={`${fieldClass} pl-10`}
            />
          </div>
          <SegmentedControl
            value={onlyDuplicates ? "dup" : "all"}
            onChange={(v) => setOnlyDuplicates(v === "dup")}
            options={[
              { value: "all", label: "Todos" },
              { value: "dup", label: `Repetidos${summary.duplicates > 0 ? ` · ${summary.duplicates}` : ""}` },
            ]}
          />
          <NativeSelect aria-label="Ordenar coleção" value={sort} onChange={(e) => setSort(e.target.value as CollectionSort)} className="sm:w-56">
            {(Object.keys(SORT_LABEL) as CollectionSort[]).map((option) => (
              <option key={option} value={option}>
                {SORT_LABEL[option]}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : null}

      <div className="mt-6 lg:mt-8">
        {!hasCollection && state !== "loading" ? (
          <EmptyState
            kind="no-cars"
            description="Toque no coração de uma miniatura para começar sua coleção."
            action={
              <ButtonLink href="/buscar" variant="outline">
                Explorar miniaturas
              </ButtonLink>
            }
          />
        ) : state === "loading" ? (
          <CarGridSkeleton />
        ) : state === "error" ? (
          <ErrorState onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState
            kind="no-cars"
            description="Tente outro termo ou limpe os filtros."
            action={
              term ? (
                <Button variant="outline" onClick={() => setTerm("")}>
                  Limpar busca
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setOnlyDuplicates(false)}>
                  Ver todos
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
              {items.map((item) => (
                <CarCard
                  key={item.id}
                  car={item.car}
                  variant="collection"
                  quantity={item.car.quantity}
                  onChangeQuantity={(next) => handleChangeQuantity(item.carId, next)}
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
