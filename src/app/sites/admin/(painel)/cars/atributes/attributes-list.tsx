"use client";

import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/admin-shell";
import { KebabMenu } from "@/components/admin/kebab-menu";
import { SearchInput } from "@/components/admin/search-input";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import type { AdminAttribute } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { invalidateCatalog } from "@/lib/catalog";
import { useApi } from "@/lib/use-api";

export function AttributesList() {
  const { data, error, loading, reload, setData } = useApi("attributes-full", (signal) =>
    api<AdminAttribute[]>("/admin/attributes", { signal })
  );
  const [q, setQ] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminAttribute | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    return term ? data.filter((a) => a.title.toLowerCase().includes(term)) : data;
  }, [data, q]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api(`/admin/attributes/${pendingDelete.id}`, { method: "DELETE" });
      setData((prev) => (prev ?? []).filter((a) => a.id !== pendingDelete.id));
      invalidateCatalog("attributes");
      toast.success("Atributo excluído.");
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Atributos"
        description="Rótulos usados para filtrar e destacar miniaturas."
        breadcrumb="Catálogo / Miniaturas"
        actions={
          <ButtonLink href="/cars/atributes/new" leftIcon={Plus} size="sm" className="sm:h-11 sm:px-4 sm:text-body">
            Novo atributo
          </ButtonLink>
        }
      />

      <SearchInput className="mb-4" label="Buscar atributo" placeholder="Buscar atributo" value={q} onChange={setQ} />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading || !data ? (
        <div aria-busy="true" className="overflow-hidden rounded-lg bg-surface shadow-card">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
              <Skeleton className="size-8 shrink-0 rounded-md" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="rounded-lg bg-surface shadow-card">
          {data.length ? (
            <EmptyState kind="no-content" size="sm" />
          ) : (
            <EmptyState
              kind="no-content"
              action={
                <ButtonLink href="/cars/atributes/new" leftIcon={Plus}>
                  Cadastrar atributo
                </ButtonLink>
              }
            />
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-surface shadow-card">
          {filtered.map((attr) => (
            <AttributeRow key={attr.id} attribute={attr} onDelete={() => setPendingDelete(attr)} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Excluir atributo?"
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
      >
        <p>
          <strong className="text-fg">{pendingDelete?.title}</strong> será removido de {pendingDelete?.carCount ?? 0} miniaturas.
        </p>
        {deleteError ? (
          <p role="alert" className="mt-2 text-danger">
            {deleteError}
          </p>
        ) : null}
      </ConfirmDialog>
    </>
  );
}

function AttributeRow({ attribute, onDelete }: { attribute: AdminAttribute; onDelete: () => void }) {
  const router = useRouter();
  const goEdit = () => router.push(`/cars/atributes/${attribute.id}/edit`);
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goEdit}
      onKeyDown={(e) => e.key === "Enter" && goEdit()}
      className="flex cursor-pointer items-center gap-3 border-b border-border px-5 py-4 last:border-0 hover:bg-surface-3/50"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
        <Sparkles size={16} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-fg">{attribute.title}</p>
        {attribute.description ? <p className="line-clamp-1 text-body-sm text-fg-muted">{attribute.description}</p> : null}
      </div>
      <span className="shrink-0 font-mono text-body-sm text-fg-subtle">{attribute.carCount} miniaturas</span>
      <KebabMenu
        label={`Ações de ${attribute.title}`}
        items={[
          { label: "Editar", icon: Pencil, onSelect: goEdit },
          { label: "Ver miniaturas", icon: Sparkles, onSelect: () => router.push(`/cars?attr=${attribute.id}`) },
          { label: "Excluir", icon: Trash2, danger: true, onSelect: onDelete },
        ]}
      />
    </div>
  );
}
