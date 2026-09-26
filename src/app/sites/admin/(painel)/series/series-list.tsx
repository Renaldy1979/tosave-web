"use client";

import { Flame, Layers, Pencil, Plus, Star, StarOff, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/admin-shell";
import { KebabMenu } from "@/components/admin/kebab-menu";
import { Pager } from "@/components/admin/pager";
import { SearchInput } from "@/components/admin/search-input";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import type { AdminSerie } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { serieLogoUrl } from "@/lib/appwrite";
import { invalidateCatalog } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { useApi } from "@/lib/use-api";
import { useCursorPage } from "@/lib/use-cursor-page";

const nf = new Intl.NumberFormat("pt-BR");
const LIMIT = 24;

type Tab = "all" | "featured";

export function SeriesList() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get("q") ?? "";
  const tab: Tab = params.get("tab") === "featured" ? "featured" : "all";

  const featuredCount = useApi("series-featured-count", (signal) =>
    api<{ items: AdminSerie[]; total: number | null }>("/admin/series", { query: { featured: true, limit: 1 }, signal }).then(
      (p) => p.total ?? 0
    )
  );

  function setParam(patch: { q?: string; tab?: Tab }) {
    const next = new URLSearchParams(params.toString());
    if (patch.q !== undefined) {
      if (patch.q) next.set("q", patch.q);
      else next.delete("q");
    }
    if (patch.tab !== undefined) {
      if (patch.tab === "featured") next.set("tab", "featured");
      else next.delete("tab");
    }
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="Séries"
        breadcrumb="Catálogo"
        actions={
          <ButtonLink href="/series/new" leftIcon={Plus} size="sm" className="sm:h-11 sm:px-4 sm:text-body">
            Nova série
          </ButtonLink>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex h-9 shrink-0 items-center gap-1 self-start rounded-md bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setParam({ tab: "all" })}
            className={cn(
              "h-7 rounded-sm px-3 text-body-sm transition duration-fast",
              tab === "all" ? "bg-surface-3 text-fg shadow-card" : "text-fg-muted"
            )}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setParam({ tab: "featured" })}
            className={cn(
              "h-7 rounded-sm px-3 text-body-sm transition duration-fast",
              tab === "featured" ? "bg-surface-3 text-fg shadow-card" : "text-fg-muted"
            )}
          >
            Em destaque{featuredCount.data !== undefined ? ` (${featuredCount.data})` : ""}
          </button>
        </div>
        <SearchInput className="sm:w-80" label="Buscar série" placeholder="Buscar série" value={q} onChange={(v) => setParam({ q: v.trim() })} />
      </div>

      <SeriesGrid key={`${tab}:${q}`} q={q} tab={tab} onDeleted={() => featuredCount.reload()} onFeaturedChange={() => featuredCount.reload()} />
    </>
  );
}

function SeriesGrid({
  q,
  tab,
  onDeleted,
  onFeaturedChange,
}: {
  q: string;
  tab: Tab;
  onDeleted: () => void;
  onFeaturedChange: () => void;
}) {
  const page = useCursorPage<AdminSerie>("series", (cursor, signal) =>
    api("/admin/series", { query: { q: q || undefined, featured: tab === "featured" ? true : undefined, cursor, limit: LIMIT }, signal })
  );
  const [pendingDelete, setPendingDelete] = useState<AdminSerie | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (page.error) return <ErrorState onRetry={page.reload} />;

  if (page.loading || !page.data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-video rounded-lg" />
        ))}
      </div>
    );
  }

  if (!page.data.items.length) {
    if (q || tab === "featured") {
      return (
        <EmptyState
          kind="no-content"
          size="sm"
          description={tab === "featured" ? "Ative “Destacar na página inicial” em uma série." : "Tente outro termo de busca."}
        />
      );
    }
    return (
      <EmptyState
        kind="no-content"
        action={
          <ButtonLink href="/series/new" leftIcon={Plus}>
            Cadastrar série
          </ButtonLink>
        }
      />
    );
  }

  async function toggleFeatured(serie: AdminSerie) {
    const next = !serie.isDefault;
    page.setData((prev) => ({ ...prev!, items: prev!.items.map((s) => (s.id === serie.id ? { ...s, isDefault: next } : s)) }));
    try {
      await api<AdminSerie>(`/admin/series/${serie.id}`, { method: "PUT", body: { isDefault: next } });
      toast.success(next ? "Série adicionada aos destaques." : "Série removida dos destaques.");
      onFeaturedChange();
    } catch (err) {
      page.setData((prev) => ({ ...prev!, items: prev!.items.map((s) => (s.id === serie.id ? { ...s, isDefault: !next } : s)) }));
      toast.error(errorMessage(err));
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api(`/admin/series/${pendingDelete.id}`, { method: "DELETE" });
      page.setData((prev) => ({ ...prev!, items: prev!.items.filter((s) => s.id !== pendingDelete.id) }));
      invalidateCatalog();
      toast.success("Série excluída.");
      setPendingDelete(null);
      onDeleted();
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const items = [...page.data.items].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((serie) => (
          <SerieCard
            key={serie.id}
            serie={serie}
            onToggleFeatured={() => void toggleFeatured(serie)}
            onDelete={() => setPendingDelete(serie)}
          />
        ))}
      </div>

      <Pager pageIndex={page.pageIndex} limit={LIMIT} count={page.data.items.length} total={page.total} hasNext={page.hasNext} onPrev={page.prev} onNext={page.next} />

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Excluir série?"
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

function SerieCard({ serie, onToggleFeatured, onDelete }: { serie: AdminSerie; onToggleFeatured: () => void; onDelete: () => void }) {
  const router = useRouter();
  const logo = serieLogoUrl(serie.imageFileId);
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/series/${serie.id}/edit`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/series/${serie.id}/edit`)}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-lg bg-surface shadow-card transition duration-fast hover:shadow-card-hover",
        serie.isDefault && "ring-1 ring-primary/50"
      )}
    >
      <div className="relative aspect-video bg-card-stage">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview do Appwrite
          <img src={logo} alt="" className="size-full object-contain p-6" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Layers size={40} strokeWidth={1.5} className="text-fg-subtle/40" aria-hidden />
          </div>
        )}
        {serie.isDefault ? (
          <Badge variant="flame" icon={Flame} className="absolute top-2 left-2">
            Em destaque
          </Badge>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="min-w-0">
          <p className="truncate font-semibold text-fg">{serie.name}</p>
          <p className="font-mono text-body-sm text-fg-subtle">{nf.format(serie.carCount)} miniaturas</p>
        </div>
        <KebabMenu
          label={`Ações de ${serie.name}`}
          items={[
            { label: "Editar", icon: Pencil, onSelect: () => router.push(`/series/${serie.id}/edit`) },
            serie.isDefault
              ? { label: "Remover dos destaques", icon: StarOff, onSelect: onToggleFeatured }
              : { label: "Adicionar aos destaques", icon: Star, onSelect: onToggleFeatured },
            { label: "Excluir", icon: Trash2, danger: true, onSelect: onDelete },
          ]}
        />
      </div>
    </div>
  );
}
