"use client";

import { Eye, EyeOff, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/admin-shell";
import { KebabMenu } from "@/components/admin/kebab-menu";
import { SearchInput } from "@/components/admin/search-input";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { NativeSelect } from "@/components/ui/select";
import type { AdminBrand } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { invalidateCatalog } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { useApi } from "@/lib/use-api";

type Visibility = "" | "visible" | "hidden";

export function BrandsList() {
  const { data, error, loading, reload, setData } = useApi("brands-full", (signal) => api<AdminBrand[]>("/admin/brands", { signal }));
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("");
  const [pendingDelete, setPendingDelete] = useState<AdminBrand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    return data.filter((b) => {
      if (term && !b.name.toLowerCase().includes(term)) return false;
      if (visibility === "visible" && !b.active) return false;
      if (visibility === "hidden" && b.active) return false;
      return true;
    });
  }, [data, q, visibility]);

  async function toggleVisible(brand: AdminBrand) {
    const next = !brand.active;
    setData((prev) => (prev ?? []).map((b) => (b.id === brand.id ? { ...b, active: next } : b)));
    try {
      const updated = await api<AdminBrand>(`/admin/brands/${brand.id}`, { method: "PUT", body: { active: next } });
      setData((prev) => (prev ?? []).map((b) => (b.id === brand.id ? updated : b)));
      invalidateCatalog("brands");
      toast.success(next ? "Marca visível no site." : "Marca oculta do site.", {
        action: {
          label: "Desfazer",
          onClick: () => void toggleVisible({ ...brand, active: next }),
        },
      });
    } catch (err) {
      setData((prev) => (prev ?? []).map((b) => (b.id === brand.id ? { ...b, active: !next } : b)));
      toast.error(errorMessage(err));
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api(`/admin/brands/${pendingDelete.id}`, { method: "DELETE" });
      setData((prev) => (prev ?? []).filter((b) => b.id !== pendingDelete.id));
      invalidateCatalog("brands");
      toast.success("Marca excluída.");
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
        title="Marcas"
        breadcrumb="Catálogo"
        actions={
          <ButtonLink href="/brands/new" leftIcon={Plus} size="sm" className="sm:h-11 sm:px-4 sm:text-body">
            Nova marca
          </ButtonLink>
        }
      />

      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <SearchInput className="flex-1" label="Buscar marca" placeholder="Buscar marca" value={q} onChange={setQ} />
        <NativeSelect
          aria-label="Visibilidade"
          className="sm:w-48"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
        >
          <option value="">Todas</option>
          <option value="visible">Visíveis</option>
          <option value="hidden">Ocultas</option>
        </NativeSelect>
      </div>

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading || !data ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6" aria-busy="true">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : !filtered.length ? (
        data.length ? (
          <EmptyState kind="no-content" size="sm" description="Tente outro termo ou limpe os filtros." />
        ) : (
          <EmptyState
            kind="no-content"
            action={
              <ButtonLink href="/brands/new" leftIcon={Plus}>
                Cadastrar marca
              </ButtonLink>
            }
          />
        )
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((brand) => (
            <BrandTile key={brand.id} brand={brand} onToggle={() => void toggleVisible(brand)} onDelete={() => setPendingDelete(brand)} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Excluir marca?"
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
      >
        <p>
          <strong className="text-fg">{pendingDelete?.name}</strong> será excluída.
        </p>
        {pendingDelete?.carCount ? (
          <p className="mt-1">
            Ela possui <strong className="text-fg">{pendingDelete.carCount} miniaturas</strong> vinculadas.
          </p>
        ) : null}
        {deleteError ? (
          <p role="alert" className="mt-2 text-danger">
            {deleteError}
          </p>
        ) : null}
      </ConfirmDialog>
    </>
  );
}

function BrandTile({ brand, onToggle, onDelete }: { brand: AdminBrand; onToggle: () => void; onDelete: () => void }) {
  const router = useRouter();
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/brands/${brand.id}/edit`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/brands/${brand.id}/edit`)}
      className={cn("cursor-pointer rounded-lg bg-surface p-4 shadow-card transition duration-fast", !brand.active && "opacity-60")}
    >
      <div className="mb-3 flex aspect-square items-center justify-center rounded-md bg-surface-2 p-4">
        <Tag size={28} strokeWidth={1.5} className="text-fg-subtle" aria-hidden />
      </div>
      <div className="flex items-start justify-between gap-1">
        <p className="min-w-0 flex-1 truncate font-semibold text-fg">{brand.name}</p>
        <KebabMenu
          label={`Ações de ${brand.name}`}
          items={[
            { label: "Editar", icon: Pencil, onSelect: () => router.push(`/brands/${brand.id}/edit`) },
            brand.active
              ? { label: "Ocultar do site", icon: EyeOff, onSelect: onToggle }
              : { label: "Mostrar no site", icon: Eye, onSelect: onToggle },
            { label: "Excluir", icon: Trash2, danger: true, onSelect: onDelete },
          ]}
        />
      </div>
      <p className="mt-1 flex items-center gap-1 text-caption text-fg-subtle">
        {brand.active ? (
          <>
            <Eye size={13} aria-hidden /> Visível
          </>
        ) : (
          <>
            <EyeOff size={13} aria-hidden /> Oculta
          </>
        )}
      </p>
    </div>
  );
}
