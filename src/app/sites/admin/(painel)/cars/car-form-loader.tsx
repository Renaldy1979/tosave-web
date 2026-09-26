"use client";

import { PageHeader } from "@/components/admin/admin-shell";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { ButtonLink } from "@/components/ui/button";
import type { AdminAttribute, AdminBrand, AdminCar } from "@/lib/admin-types";
import { api, ApiError } from "@/lib/api";
import { loadAttributes, loadBrands } from "@/lib/catalog";
import { useApi } from "@/lib/use-api";
import { CarForm } from "./car-form";

type Loaded = { car: AdminCar | null; brands: AdminBrand[]; attributes: AdminAttribute[] };

/** Carrega o carro (edição) e as listas do formulário. */
export function CarFormLoader({ carId }: { carId: string | null }) {
  const { data, error, loading, reload } = useApi<Loaded>(`car-form:${carId ?? "new"}`, async (signal) => {
    const [car, brands, attributes] = await Promise.all([
      carId ? api<AdminCar>(`/admin/cars/${encodeURIComponent(carId)}`, { signal }) : Promise.resolve(null),
      loadBrands(),
      loadAttributes(),
    ]);
    return { car, brands, attributes };
  });

  if (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return (
        <>
          <PageHeader title="Miniatura" breadcrumb="Catálogo / Miniaturas" />
          <div className="rounded-lg bg-surface shadow-card">
            <EmptyState
              kind="no-cars"
              description="Esta miniatura não existe ou foi removida."
              action={<ButtonLink href="/cars" variant="secondary">Voltar para a lista</ButtonLink>}
            />
          </div>
        </>
      );
    }
    return <ErrorState onRetry={reload} />;
  }

  if (loading || !data) {
    return (
      <div aria-busy="true">
        <Skeleton className="mb-2 h-4 w-40" />
        <Skeleton className="mb-8 h-9 w-72" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Skeleton className="aspect-card rounded-lg" />
            <Skeleton className="h-72 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <Skeleton className="hidden h-96 rounded-lg lg:col-span-4 lg:block" />
        </div>
      </div>
    );
  }

  return <CarForm car={data.car} brands={data.brands} attributes={data.attributes} />;
}
