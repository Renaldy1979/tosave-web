"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CarThumb } from "@/components/admin/car-thumb";
import { Skeleton } from "@/components/ui/feedback";
import type { AdminCar, Page } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";

const LIMIT = 8;

type LinkedCarsProps = {
  title: string;
  filterKey: "serieId" | "brandId";
  filterValue: string;
};

/** Grade de até 8 miniaturas vinculadas, embutida na edição de série/marca (telas/admin-series.md, admin-marcas.md). */
export function LinkedCars({ title, filterKey, filterValue }: LinkedCarsProps) {
  const { data, error, loading } = useApi(`linked-cars:${filterKey}:${filterValue}`, (signal) =>
    api<Page<AdminCar>>("/admin/cars", { query: { [filterKey]: filterValue, limit: LIMIT }, signal })
  );

  const seeAllHref = `/cars?${filterKey}=${filterValue}`;

  return (
    <section className="rounded-lg bg-surface p-5 shadow-card md:p-6">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-h3 text-fg">{title}</h2>
        <Link href={seeAllHref} className="flex shrink-0 items-center gap-1 text-body-sm font-medium text-primary-text hover:underline">
          Ver todas
          {data?.total !== null && data?.total !== undefined ? ` (${data.total})` : ""}
          <ArrowRight size={14} aria-hidden />
        </Link>
      </header>

      {error ? (
        <p className="text-body-sm text-fg-subtle">Não foi possível carregar as miniaturas.</p>
      ) : loading || !data ? (
        <div aria-busy="true" className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: LIMIT }, (_, i) => (
            <Skeleton key={i} className="h-[54px] rounded-md" />
          ))}
        </div>
      ) : !data.items.length ? (
        <p className="text-body-sm text-fg-subtle">Nenhuma miniatura vinculada.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((car) => (
            <li key={car.id}>
              <Link
                href={`/cars/${car.id}/edit`}
                className="flex items-center gap-2.5 rounded-md p-1.5 transition duration-fast hover:bg-surface-3/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CarThumb fileId={car.imageFileId} alt="" className="h-[54px] w-[72px] shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-body-sm font-medium text-fg">{car.name}</p>
                  {car.toy ? <p className="truncate font-mono text-caption text-fg-subtle">{car.toy}</p> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
