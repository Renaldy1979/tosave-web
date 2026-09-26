"use client";

import { PageHeader } from "@/components/admin/admin-shell";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import type { AdminSerie } from "@/lib/admin-types";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { SerieForm } from "./serie-form";

/** Carrega a série (edição) e o total de destaques (para o texto de ajuda do switch). */
export function SerieFormLoader({ serieId }: { serieId: string | null }) {
  const { data, error, loading, reload } = useApi(`serie-form:${serieId ?? "new"}`, async (signal) => {
    const [serie, featured] = await Promise.all([
      serieId ? api<AdminSerie>(`/admin/series/${encodeURIComponent(serieId)}`, { signal }) : Promise.resolve(null),
      api<{ total: number | null }>("/admin/series", { query: { featured: true, limit: 1 }, signal }).then((p) => p.total ?? 0),
    ]);
    return { serie, featuredCount: featured };
  });

  if (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return (
        <>
          <PageHeader title="Série" breadcrumb="Catálogo / Séries" />
          <div className="rounded-lg bg-surface shadow-card">
            <EmptyState
              kind="no-content"
              description="Esta série não existe ou foi removida."
              action={
                <ButtonLink href="/series" variant="secondary">
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

  if (loading || !data) {
    return (
      <div aria-busy="true">
        <Skeleton className="mb-2 h-4 w-40" />
        <Skeleton className="mb-8 h-9 w-72" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="aspect-video rounded-lg lg:col-span-5" />
          <Skeleton className="h-72 rounded-lg lg:col-span-7" />
        </div>
      </div>
    );
  }

  return <SerieForm serie={data.serie} featuredCount={data.featuredCount} />;
}
