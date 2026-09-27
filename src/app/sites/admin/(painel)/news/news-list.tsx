"use client";

import { Eye, EyeOff, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
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
import { SegmentedControl } from "@/components/ui/segmented";
import type { AdminNews } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { newsImageUrl } from "@/lib/appwrite";
import { useCursorPage } from "@/lib/use-cursor-page";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const LIMIT = 24;

type Status = "all" | "published" | "draft";

export function NewsList() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get("q") ?? "";
  const statusParam = params.get("status");
  const status: Status = statusParam === "published" || statusParam === "draft" ? statusParam : "all";

  function setParam(patch: { q?: string; status?: Status }) {
    const next = new URLSearchParams(params.toString());
    if (patch.q !== undefined) {
      if (patch.q) next.set("q", patch.q);
      else next.delete("q");
    }
    if (patch.status !== undefined) {
      if (patch.status === "all") next.delete("status");
      else next.set("status", patch.status);
    }
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="Notícias"
        breadcrumb="Comunidade"
        actions={
          <ButtonLink href="/news/new" leftIcon={Plus} size="sm" className="sm:h-11 sm:px-4 sm:text-body">
            Nova notícia
          </ButtonLink>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          className="shrink-0 self-start"
          value={status}
          onChange={(v) => setParam({ status: v })}
          options={[
            { value: "all", label: "Todas" },
            { value: "published", label: "Publicadas" },
            { value: "draft", label: "Rascunhos" },
          ]}
        />
        <SearchInput className="sm:w-80" label="Buscar notícia" placeholder="Título ou resumo" value={q} onChange={(v) => setParam({ q: v.trim() })} />
      </div>

      <NewsGrid key={`${status}:${q}`} q={q} status={status} />
    </>
  );
}

function NewsGrid({ q, status }: { q: string; status: Status }) {
  const router = useRouter();
  const page = useCursorPage<AdminNews>("news", (cursor, signal) =>
    api("/admin/news", {
      query: { q: q || undefined, published: status === "published" ? true : status === "draft" ? false : undefined, cursor, limit: LIMIT },
      signal,
    })
  );
  const [pendingDelete, setPendingDelete] = useState<AdminNews | null>(null);
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
    if (q || status !== "all") {
      return (
        <EmptyState
          kind="no-content"
          size="sm"
          description={status === "draft" ? "Nenhum rascunho por aqui." : status === "published" ? "Nenhuma notícia publicada ainda." : "Tente outro termo de busca."}
        />
      );
    }
    return (
      <EmptyState
        kind="no-content"
        action={
          <ButtonLink href="/news/new" leftIcon={Plus}>
            Escrever notícia
          </ButtonLink>
        }
      />
    );
  }

  async function togglePublish(news: AdminNews) {
    const next = !news.published;
    page.setData((prev) => ({ ...prev!, items: prev!.items.map((n) => (n.id === news.id ? { ...n, published: next } : n)) }));
    try {
      const updated = await api<AdminNews>(`/admin/news/${news.id}/${next ? "publish" : "unpublish"}`, { method: "POST" });
      page.setData((prev) => ({ ...prev!, items: prev!.items.map((n) => (n.id === news.id ? updated : n)) }));
      toast.success(next ? "Notícia publicada." : "Notícia despublicada.");
    } catch (err) {
      page.setData((prev) => ({ ...prev!, items: prev!.items.map((n) => (n.id === news.id ? { ...n, published: !next } : n)) }));
      toast.error(errorMessage(err));
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api(`/admin/news/${pendingDelete.id}`, { method: "DELETE" });
      page.setData((prev) => ({ ...prev!, items: prev!.items.filter((n) => n.id !== pendingDelete.id) }));
      toast.success("Notícia excluída.");
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {page.data.items.map((news) => (
          <NewsCard
            key={news.id}
            news={news}
            onEdit={() => router.push(`/news/${news.id}/edit`)}
            onTogglePublish={() => void togglePublish(news)}
            onDelete={() => setPendingDelete(news)}
          />
        ))}
      </div>

      <Pager pageIndex={page.pageIndex} limit={LIMIT} count={page.data.items.length} total={page.total} hasNext={page.hasNext} onPrev={page.prev} onNext={page.next} />

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Excluir notícia?"
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
      >
        <p>
          <strong className="text-fg">{pendingDelete?.title}</strong> será excluída{pendingDelete?.imageFileId ? ", junto com a imagem" : ""}.
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

function NewsCard({
  news,
  onEdit,
  onTogglePublish,
  onDelete,
}: {
  news: AdminNews;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  const image = newsImageUrl(news.imageFileId);
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => e.key === "Enter" && onEdit()}
      className="group cursor-pointer overflow-hidden rounded-lg bg-surface shadow-card transition duration-fast hover:shadow-card-hover"
    >
      <div className="relative aspect-video bg-card-stage">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview do Appwrite
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Newspaper size={40} strokeWidth={1.5} className="text-fg-subtle/40" aria-hidden />
          </div>
        )}
        <Badge variant={news.published ? "success" : "outline"} className="absolute top-2 left-2 bg-surface/90">
          {news.published ? "Publicada" : "Rascunho"}
        </Badge>
      </div>
      <div className="p-4">
        <p className="text-caption text-fg-subtle">{news.publishedAt ? dateFormatter.format(new Date(news.publishedAt)) : "Sem publicação"}</p>
        <div className="mt-1 flex items-start justify-between gap-2">
          <p className="line-clamp-2 min-h-[2lh] font-semibold text-fg">{news.title}</p>
          <KebabMenu
            label={`Ações de ${news.title}`}
            items={[
              { label: "Editar", icon: Pencil, onSelect: onEdit },
              news.published
                ? { label: "Despublicar", icon: EyeOff, onSelect: onTogglePublish }
                : { label: "Publicar", icon: Eye, onSelect: onTogglePublish },
              { label: "Excluir", icon: Trash2, danger: true, onSelect: onDelete },
            ]}
          />
        </div>
        {news.summary ? <p className="mt-1 line-clamp-2 text-body-sm text-fg-muted">{news.summary}</p> : null}
      </div>
    </div>
  );
}
