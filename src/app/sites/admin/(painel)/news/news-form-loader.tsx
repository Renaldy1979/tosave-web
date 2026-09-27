"use client";

import { PageHeader } from "@/components/admin/admin-shell";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import type { AdminNews } from "@/lib/admin-types";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { NewsForm } from "./news-form";

/** `data` é `AdminNews | null` (`null` = notícia nova); o loading vem de `loading`, não de `!data`. */
export function NewsFormLoader({ newsId }: { newsId: string | null }) {
  const { data, error, loading, reload } = useApi(`news-form:${newsId ?? "new"}`, (signal) =>
    newsId ? api<AdminNews>(`/admin/news/${encodeURIComponent(newsId)}`, { signal }) : Promise.resolve(null)
  );

  if (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return (
        <>
          <PageHeader title="Notícia" breadcrumb="Comunidade / Notícias" />
          <div className="rounded-lg bg-surface shadow-card">
            <EmptyState
              kind="no-content"
              description="Esta notícia não existe ou foi removida."
              action={
                <ButtonLink href="/news" variant="secondary">
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

  if (loading) {
    return (
      <div aria-busy="true">
        <Skeleton className="mb-2 h-4 w-40" />
        <Skeleton className="mb-8 h-9 w-72" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-96 rounded-lg lg:col-span-8" />
          <Skeleton className="aspect-video rounded-lg lg:col-span-4" />
        </div>
      </div>
    );
  }

  return <NewsForm news={data ?? null} />;
}
