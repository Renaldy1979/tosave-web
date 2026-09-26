"use client";

import { PageHeader } from "@/components/admin/admin-shell";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { ApiError } from "@/lib/api";
import { loadAttributes } from "@/lib/catalog";
import { useApi } from "@/lib/use-api";
import { AttributeForm } from "./attribute-form";

export function AttributeFormLoader({ attributeId }: { attributeId: string | null }) {
  const { data, error, loading, reload } = useApi(`attribute-form:${attributeId ?? "new"}`, async () => {
    const attributes = await loadAttributes();
    const attribute = attributeId ? (attributes.find((a) => a.id === attributeId) ?? null) : null;
    if (attributeId && !attribute) throw new ApiError(404, "Atributo não encontrado.");
    return attribute;
  });

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <>
          <PageHeader title="Atributo" breadcrumb="Catálogo / Miniaturas / Atributos" />
          <div className="rounded-lg bg-surface shadow-card">
            <EmptyState
              kind="no-content"
              description="Este atributo não existe ou foi removido."
              action={
                <ButtonLink href="/cars/atributes" variant="secondary">
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
        <Skeleton className="mx-auto h-64 max-w-[640px] rounded-lg" />
      </div>
    );
  }

  return <AttributeForm attribute={data} />;
}
