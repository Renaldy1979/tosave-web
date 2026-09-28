"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Eye, PhoneOff, Repeat, Trash2, User, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/admin-shell";
import { CarThumb } from "@/components/admin/car-thumb";
import { KebabMenu } from "@/components/admin/kebab-menu";
import { Pager } from "@/components/admin/pager";
import { SearchInput } from "@/components/admin/search-input";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { NativeSelect } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented";
import type { AdminTradeListing, TradeCar } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { useCursorPage } from "@/lib/use-cursor-page";

const LIMIT = 20;
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type Status = "all" | "ACTIVE" | "COMPLETED" | "CANCELLED";
type Type = "" | "TRADE" | "SALE";

const TYPE_LABEL: Record<"TRADE" | "SALE", string> = { TRADE: "Troca", SALE: "Venda" };
const STATUS_LABEL: Record<AdminTradeListing["status"], string> = {
  ACTIVE: "Ativo",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};
const STATUS_VARIANT: Record<AdminTradeListing["status"], BadgeVariant> = {
  ACTIVE: "primary",
  COMPLETED: "success",
  CANCELLED: "outline",
};

export function TradeList() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get("q") ?? "";
  const statusParam = params.get("status");
  const status: Status = statusParam === "ACTIVE" || statusParam === "COMPLETED" || statusParam === "CANCELLED" ? statusParam : "all";
  const typeParam = params.get("type");
  const type: Type = typeParam === "TRADE" || typeParam === "SALE" ? typeParam : "";

  function setParam(patch: { q?: string; status?: Status; type?: Type }) {
    const next = new URLSearchParams(params.toString());
    if (patch.q !== undefined) {
      if (patch.q) next.set("q", patch.q);
      else next.delete("q");
    }
    if (patch.status !== undefined) {
      if (patch.status === "all") next.delete("status");
      else next.set("status", patch.status);
    }
    if (patch.type !== undefined) {
      if (patch.type === "") next.delete("type");
      else next.set("type", patch.type);
    }
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <>
      <PageHeader title="Clube da Troca" breadcrumb="Comunidade" description="Modere os anúncios de troca e venda dos colecionadores." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          className="shrink-0 self-start"
          value={status}
          onChange={(v) => setParam({ status: v })}
          options={[
            { value: "all", label: "Todos" },
            { value: "ACTIVE", label: "Ativos" },
            { value: "COMPLETED", label: "Concluídos" },
            { value: "CANCELLED", label: "Cancelados" },
          ]}
        />
        <div className="flex gap-2 sm:w-auto">
          <NativeSelect
            aria-label="Tipo de anúncio"
            className="w-40"
            value={type}
            onChange={(e) => setParam({ type: e.target.value as Type })}
          >
            <option value="">Todos os tipos</option>
            <option value="TRADE">Troca</option>
            <option value="SALE">Venda</option>
          </NativeSelect>
          <SearchInput
            className="sm:w-72"
            label="Buscar anúncio"
            placeholder="Nome ou código do carro"
            value={q}
            onChange={(v) => setParam({ q: v.trim() })}
          />
        </div>
      </div>

      <TradeTable key={`${status}:${type}:${q}`} q={q} status={status} type={type} />
    </>
  );
}

function TradeTable({ q, status, type }: { q: string; status: Status; type: Type }) {
  const page = useCursorPage<AdminTradeListing>("trade", (cursor, signal) =>
    api("/admin/trade", {
      query: { q: q || undefined, status: status === "all" ? undefined : status, type: type || undefined, cursor, limit: LIMIT },
      signal,
    })
  );
  const [selected, setSelected] = useState<AdminTradeListing | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminTradeListing | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (page.error) return <ErrorState onRetry={page.reload} />;

  if (page.loading || !page.data) {
    return (
      <div aria-busy="true" className="overflow-hidden rounded-lg bg-surface shadow-card">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
            <Skeleton className="h-[42px] w-[56px] shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-1/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!page.data.items.length) {
    return (
      <div className="rounded-lg bg-surface shadow-card">
        <EmptyState
          kind="no-content"
          icon={Repeat}
          description={q || status !== "all" || type ? "Tente outro termo ou limpe os filtros." : "Nenhum anúncio no Clube da Troca ainda."}
        />
      </div>
    );
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api(`/admin/trade/${pendingDelete.id}`, { method: "DELETE" });
      page.setData((prev) => ({ ...prev!, items: prev!.items.filter((t) => t.id !== pendingDelete.id) }));
      toast.success("Anúncio excluído.");
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Desktop: tabela */}
      <div className="hidden overflow-hidden rounded-lg bg-surface shadow-card md:block">
        <table className="w-full text-left">
          <thead className="bg-surface-2">
            <tr className="font-condensed text-eyebrow text-fg-subtle uppercase">
              <th className="w-[88px] py-3 pr-4 pl-4 font-semibold" scope="col">
                <span className="sr-only">Foto</span>
              </th>
              <th className="py-3 pr-4 font-semibold" scope="col">Anúncio</th>
              <th className="py-3 pr-4 font-semibold" scope="col">Anunciante</th>
              <th className="py-3 pr-4 font-semibold" scope="col">Tipo</th>
              <th className="py-3 pr-4 font-semibold" scope="col">Status</th>
              <th className="py-3 pr-4 font-semibold" scope="col">Criado em</th>
              <th className="w-11 py-3 pr-4 font-semibold" scope="col">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {page.data.items.map((listing) => (
              <tr
                key={listing.id}
                onClick={() => setSelected(listing)}
                className="cursor-pointer border-t border-border transition duration-fast hover:bg-surface-3/50"
              >
                <td className="py-2.5 pr-4 pl-4">
                  <CarThumb fileId={listing.car.imageFileId} alt="" className="h-[42px] w-[56px] rounded-md" iconSize={18} />
                </td>
                <td className="py-2.5 pr-4">
                  <p className="line-clamp-1 font-medium text-fg">{listing.car.title}</p>
                  <p className="text-body-sm text-fg-subtle">
                    {[listing.car.brandName, listing.car.toy ? `#${listing.car.collector}` : null].filter(Boolean).join(" · ") || "—"}
                    {listing.type === "SALE" && listing.price !== null ? ` · ${currencyFormatter.format(listing.price)}` : ""}
                    {listing.type === "TRADE" && listing.desiredCars.length
                      ? ` · ${listing.desiredCars.length} carro(s) desejado(s)`
                      : ""}
                  </p>
                </td>
                <td className="py-2.5 pr-4 text-body-sm text-fg-muted">{listing.userName}</td>
                <td className="py-2.5 pr-4">
                  <Badge variant="outline">{TYPE_LABEL[listing.type]}</Badge>
                </td>
                <td className="py-2.5 pr-4">
                  <Badge variant={STATUS_VARIANT[listing.status]}>{STATUS_LABEL[listing.status]}</Badge>
                </td>
                <td className="py-2.5 pr-4 font-mono text-body-sm text-fg-muted">{dateFormatter.format(new Date(listing.createdAt))}</td>
                <td className="py-2.5 pr-4" onClick={(e) => e.stopPropagation()}>
                  <KebabMenu
                    label={`Ações do anúncio de ${listing.car.title}`}
                    items={[
                      { label: "Ver detalhes", icon: Eye, onSelect: () => setSelected(listing) },
                      { label: "Excluir anúncio", icon: Trash2, danger: true, onSelect: () => setPendingDelete(listing) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular: cartões */}
      <ul className="space-y-2 md:hidden">
        {page.data.items.map((listing) => (
          <li
            key={listing.id}
            role="link"
            tabIndex={0}
            onClick={() => setSelected(listing)}
            onKeyDown={(e) => e.key === "Enter" && setSelected(listing)}
            className="flex cursor-pointer items-center gap-3 rounded-lg bg-surface p-2.5 shadow-card active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CarThumb fileId={listing.car.imageFileId} alt="" className="h-[54px] w-[72px] shrink-0 rounded-md" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-body-sm font-semibold text-fg">{listing.car.title}</p>
              <p className="truncate text-caption text-fg-subtle">{listing.userName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" size="sm">
                  {TYPE_LABEL[listing.type]}
                </Badge>
                <Badge variant={STATUS_VARIANT[listing.status]} size="sm">
                  {STATUS_LABEL[listing.status]}
                </Badge>
              </div>
            </div>
            <KebabMenu
              label={`Ações do anúncio de ${listing.car.title}`}
              items={[
                { label: "Ver detalhes", icon: Eye, onSelect: () => setSelected(listing) },
                { label: "Excluir anúncio", icon: Trash2, danger: true, onSelect: () => setPendingDelete(listing) },
              ]}
            />
          </li>
        ))}
      </ul>

      <Pager pageIndex={page.pageIndex} limit={LIMIT} count={page.data.items.length} total={page.total} hasNext={page.hasNext} onPrev={page.prev} onNext={page.next} />

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Excluir anúncio?"
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
      >
        <p>
          O anúncio de <strong className="text-fg">{pendingDelete?.car.title}</strong> de {pendingDelete?.userName} será excluído.
        </p>
        {deleteError ? (
          <p role="alert" className="mt-2 text-danger">
            {deleteError}
          </p>
        ) : null}
      </ConfirmDialog>

      <TradeDetailDialog
        listing={selected}
        onOpenChange={(o) => !o && setSelected(null)}
        onDelete={() => {
          setPendingDelete(selected);
          setSelected(null);
        }}
      />
    </>
  );
}

function TradeDetailDialog({
  listing,
  onOpenChange,
  onDelete,
}: {
  listing: AdminTradeListing | null;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <Dialog.Root open={!!listing} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-60 animate-fade-in bg-overlay/70 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-60 max-h-[90dvh] animate-fade-in overflow-y-auto rounded-t-xl border border-border bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-modal focus:outline-none
            sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:pb-6"
        >
          {listing ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <Dialog.Title className="text-h3 text-fg">Anúncio</Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Fechar"
                    className="flex size-9 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-surface-3 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X size={18} strokeWidth={1.75} />
                  </button>
                </Dialog.Close>
              </div>
              <Dialog.Description asChild>
                <div className="mt-4 space-y-5">
                  <div className="flex gap-3">
                    <CarThumb fileId={listing.car.imageFileId} alt="" className="h-[84px] w-[112px] shrink-0 rounded-md" />
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-semibold text-fg">{listing.car.title}</p>
                      <p className="mt-0.5 text-body-sm text-fg-subtle">
                        {[listing.car.brandName, listing.car.serieTitle, listing.car.toy ? `#${listing.car.collector}` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline">{TYPE_LABEL[listing.type]}</Badge>
                        <Badge variant={STATUS_VARIANT[listing.status]}>{STATUS_LABEL[listing.status]}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-md bg-surface-2 p-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-caption text-fg-subtle">
                        <User size={14} strokeWidth={1.75} aria-hidden /> Anunciante
                      </p>
                      <p className="mt-0.5 text-body-sm font-medium text-fg">{listing.userName}</p>
                    </div>
                    <div>
                      <p className="text-caption text-fg-subtle">Criado em</p>
                      <p className="mt-0.5 text-body-sm font-medium text-fg">{dateFormatter.format(new Date(listing.createdAt))}</p>
                    </div>
                    {listing.type === "SALE" ? (
                      <div>
                        <p className="text-caption text-fg-subtle">Preço</p>
                        <p className="mt-0.5 text-body-sm font-medium text-fg">
                          {listing.price !== null ? currencyFormatter.format(listing.price) : "—"}
                        </p>
                      </div>
                    ) : null}
                    {!listing.hasContact ? (
                      <div>
                        <p className="flex items-center gap-1.5 text-caption text-fg-subtle">
                          <PhoneOff size={14} strokeWidth={1.75} aria-hidden /> Contato
                        </p>
                        <p className="mt-0.5 text-body-sm text-fg-muted">Sem telefone cadastrado</p>
                      </div>
                    ) : null}
                  </div>

                  {listing.description ? (
                    <div>
                      <p className="text-caption text-fg-subtle uppercase">Descrição</p>
                      <p className="mt-1 text-body-sm whitespace-pre-wrap text-fg">{listing.description}</p>
                    </div>
                  ) : null}

                  {listing.type === "TRADE" && listing.desiredCars.length ? (
                    <div>
                      <p className="text-caption text-fg-subtle uppercase">
                        Carros desejados ({listing.desiredCars.length})
                      </p>
                      <ul className="mt-2 space-y-2">
                        {listing.desiredCars.map((car) => (
                          <DesiredCarRow key={car.id} car={car} />
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </Dialog.Description>

              <div className="mt-6 flex justify-end">
                <Button variant="danger" leftIcon={Trash2} onClick={onDelete}>
                  Remover anúncio
                </Button>
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DesiredCarRow({ car }: { car: TradeCar }) {
  return (
    <li className="flex items-center gap-2.5">
      <CarThumb fileId={car.imageFileId} alt="" className="h-[36px] w-[48px] shrink-0 rounded-sm" iconSize={14} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-body-sm text-fg">{car.title}</p>
        <p className="truncate text-caption text-fg-subtle">{[car.brandName, car.serieTitle].filter(Boolean).join(" · ")}</p>
      </div>
    </li>
  );
}
