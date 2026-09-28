"use client";

import { Layers } from "lucide-react";
import { useMemo, useState } from "react";
import { CarCard } from "@/components/app/car-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { SegmentedControl } from "@/components/ui/segmented";
import { MOCK_CARS, MOCK_SERIES } from "../../../_mock/data";
import { useCollectionStore } from "../../../_mock/collection-store";

type Filtro = "todos" | "colecao" | "faltam";

export function SerieDetailView({ id }: { id: string }) {
  const collection = useCollectionStore();
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const serie = MOCK_SERIES.find((s) => s.id === id);
  const serieCars = useMemo(() => MOCK_CARS.filter((c) => c.serieId === id), [id]);

  if (!serie) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
        <EmptyState kind="no-content" action={<ButtonLink href="/series">Ver todas as séries</ButtonLink>} />
      </div>
    );
  }

  const total = serieCars.length;
  const ownedCount = serieCars.filter((c) => collection.quantityOf(c.id) > 0).length;
  const missingCount = total - ownedCount;
  const complete = total > 0 && ownedCount === total;
  const percent = total > 0 ? Math.round((ownedCount / total) * 100) : 0;

  const visible = serieCars.filter((c) => {
    if (filtro === "colecao") return collection.quantityOf(c.id) > 0;
    if (filtro === "faltam") return collection.quantityOf(c.id) === 0;
    return true;
  });

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
        <div className="flex size-24 items-center justify-center rounded-full bg-card-stage">
          <Layers size={32} strokeWidth={1.5} className="text-fg-subtle/40" aria-hidden />
        </div>
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
                  Você tem <span className="font-display font-extrabold text-accent">{ownedCount}</span> de {total}
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
              { value: "colecao", label: `Na coleção ${ownedCount}` },
              { value: "faltam", label: `Faltam ${missingCount}` },
            ]}
          />
        </div>
      ) : null}

      <div className="mt-6 lg:mt-8">
        {visible.length === 0 ? (
          empty
        ) : (
          <div className="grid grid-cols-2 gap-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
            {visible.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                isFavorite={collection.quantityOf(car.id) > 0}
                onToggleFavorite={() => collection.toggle(car.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
