"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CarCard } from "@/components/app/car-card";
import { StatTile } from "@/components/app/stat-tile";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { fieldClass } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented";
import { MOCK_CARS } from "../../_mock/data";
import { useCollectionStore } from "../../_mock/collection-store";

type SortOption = "recent" | "name" | "year" | "units";
const SORT_LABEL: Record<SortOption, string> = {
  recent: "Adicionados recentemente",
  name: "Nome A–Z",
  year: "Ano (mais novo)",
  units: "Mais unidades",
};

export function ColecaoView() {
  const collection = useCollectionStore();
  const [term, setTerm] = useState("");
  const [onlyDuplicates, setOnlyDuplicates] = useState(false);
  const [sort, setSort] = useState<SortOption>("recent");

  const ownedCars = useMemo(() => {
    const q = term.trim().toLowerCase();
    const items = MOCK_CARS.filter((car) => {
      const quantity = collection.quantityOf(car.id);
      if (quantity <= 0) return false;
      if (onlyDuplicates && quantity <= 1) return false;
      if (q && !car.title.toLowerCase().includes(q) && !car.toy.toLowerCase().startsWith(q)) return false;
      return true;
    });
    const sorted = [...items];
    if (sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    else if (sort === "year") sorted.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, "pt-BR"));
    else if (sort === "units") sorted.sort((a, b) => collection.quantityOf(b.id) - collection.quantityOf(a.id));
    return sorted;
  }, [term, onlyDuplicates, sort, collection]);

  const hasCollection = collection.summary.totalModels > 0;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">Minha coleção</h1>

      {hasCollection ? (
        <div className="mt-4 flex rounded-lg border border-border bg-surface p-3 lg:mt-6 lg:max-w-md">
          <StatTile value={collection.summary.totalItems} label="Itens" />
          <StatTile value={collection.summary.totalModels} label="Modelos" />
          <StatTile value={collection.summary.duplicates} label="Repetidos" />
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
              { value: "dup", label: `Repetidos${collection.summary.duplicates > 0 ? ` · ${collection.summary.duplicates}` : ""}` },
            ]}
          />
          <NativeSelect
            aria-label="Ordenar coleção"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="sm:w-56"
          >
            {(Object.keys(SORT_LABEL) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABEL[key]}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : null}

      <div className="mt-6 lg:mt-8">
        {!hasCollection ? (
          <EmptyState
            kind="no-cars"
            description="Toque no coração de uma miniatura para começar sua coleção."
            action={
              <ButtonLink href="/buscar" variant="outline">
                Explorar miniaturas
              </ButtonLink>
            }
          />
        ) : ownedCars.length === 0 ? (
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
          <div className="grid grid-cols-2 gap-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
            {ownedCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                variant="collection"
                quantity={collection.quantityOf(car.id)}
                onChangeQuantity={(next) => collection.setQuantity(car.id, next)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
