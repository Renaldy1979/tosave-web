"use client";

import { PageHeader } from "@/components/admin/admin-shell";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import type { AdminUser } from "@/lib/admin-types";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { UserDetail } from "./user-detail";

export function UserDetailLoader({ userId }: { userId: string }) {
  const { data, error, loading, reload } = useApi(`admin-user:${userId}`, (signal) =>
    api<AdminUser>(`/admin/users/${userId}`, { signal })
  );

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <>
          <PageHeader title="Usuário" breadcrumb="Sistema / Configurações / Usuários" />
          <div className="rounded-lg bg-surface shadow-card">
            <EmptyState
              kind="no-content"
              description="Este usuário não existe ou foi removido."
              action={
                <ButtonLink href="/settings?tab=usuarios" variant="secondary">
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
        <Skeleton className="mb-2 h-4 w-56" />
        <Skeleton className="mb-8 h-9 w-72" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return <UserDetail initialUser={data} />;
}
