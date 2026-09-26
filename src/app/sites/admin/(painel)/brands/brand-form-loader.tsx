"use client";

import { PageHeader } from "@/components/admin/admin-shell";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { ApiError } from "@/lib/api";
import { loadBrands } from "@/lib/catalog";
import { useApi } from "@/lib/use-api";
import { BrandForm } from "./brand-form";

export function BrandFormLoader({ brandId }: { brandId: string | null }) {
  const { data, error, loading, reload } = useApi(`brand-form:${brandId ?? "new"}`, async () => {
    const brands = await loadBrands();
    const brand = brandId ? (brands.find((b) => b.id === brandId) ?? null) : null;
    if (brandId && !brand) throw new ApiError(404, "Marca não encontrada.");
    return brand;
  });

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <>
          <PageHeader title="Marca" breadcrumb="Catálogo / Marcas" />
          <div className="rounded-lg bg-surface shadow-card">
            <EmptyState
              kind="no-content"
              description="Esta marca não existe ou foi removida."
              action={
                <ButtonLink href="/brands" variant="secondary">
                  Voltar para a lista
                </ButtonLink>
              }
            />
          </div>
        </>
      );
    }
    return <ErrorState onRetry={reload} />;
  }

  if (loading || data === undefined) {
    return (
      <div aria-busy="true">
        <Skeleton className="mb-2 h-4 w-40" />
        <Skeleton className="mb-8 h-9 w-72" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return <BrandForm brand={data} />;
}
