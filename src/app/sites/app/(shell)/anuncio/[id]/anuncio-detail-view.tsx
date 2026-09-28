"use client";

import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CarThumb } from "@/components/admin/car-thumb";
import { TradeTypeBadge } from "@/components/app/trade-listing-card";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { ApiError, errorMessage } from "@/lib/api";
import type { TradeListing } from "@/lib/app-types";
import { useMe } from "@/lib/auth";
import { cancelTradeListing, completeTradeListing, getTradeById, revealTradeContact } from "@/lib/trade";

const STATUS_LABEL: Record<TradeListing["status"], string> = {
  ACTIVE: "",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

type LoadState = "loading" | "ok" | "not-found" | "error";

function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function AnuncioDetailView({ id }: { id: string }) {
  const me = useMe();
  const [listing, setListing] = useState<TradeListing | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [phone, setPhone] = useState<string | null | undefined>(undefined);
  const [revealing, setRevealing] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    setLoadState("loading");
    getTradeById(id)
      .then((item) => {
        setListing(item);
        setPhone(undefined);
        setLoadState("ok");
      })
      .catch((err: unknown) => {
        setListing(null);
        setLoadState(err instanceof ApiError && err.status === 404 ? "not-found" : "error");
      });
  }, [id]);

  useEffect(load, [load]);

  const isOwner = Boolean(listing && listing.userId === me.id);

  const handleReveal = useCallback(async () => {
    if (!listing) return;
    setRevealing(true);
    try {
      const result = await revealTradeContact(listing.id);
      setPhone(result.phone);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRevealing(false);
    }
  }, [listing]);

  const handleComplete = useCallback(async () => {
    if (!listing) return;
    setCompleting(true);
    try {
      setListing(await completeTradeListing(listing.id));
      setCompleteOpen(false);
      toast.success("Anúncio finalizado.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCompleting(false);
    }
  }, [listing]);

  const handleCancel = useCallback(async () => {
    if (!listing) return;
    setCancelling(true);
    try {
      setListing(await cancelTradeListing(listing.id));
      setCancelOpen(false);
      toast.success("Anúncio cancelado.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCancelling(false);
    }
  }, [listing]);

  if (loadState === "loading") {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
        <div className="skeleton h-5 w-16" />
        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-lg" />
          <div className="space-y-3">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-9 w-3/4" />
            <div className="skeleton h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (loadState === "not-found") {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
        <EmptyState kind="no-content" description="Esse anúncio pode ter sido removido." action={<ButtonLink href="/troca">Voltar ao Clube da Troca</ButtonLink>} />
      </div>
    );
  }

  if (loadState === "error" || !listing) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
        <ErrorState onRetry={load} />
      </div>
    );
  }

  const car = listing.car;
  const isActive = listing.status === "ACTIVE";
  const eyebrow = [car.serieTitle, car.toy, String(car.year)].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-5 pb-32 sm:px-5 md:px-6 lg:px-8 lg:py-8 lg:pb-8">
      <Link href="/troca" className="inline-flex items-center gap-1.5 text-body-sm text-fg-muted hover:text-fg">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
        Voltar
      </Link>

      <div className="mt-4 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <div className="min-w-0">
          <CarThumb fileId={car.imageFileId} alt={car.title} size="full" iconSize={64} priority className="aspect-square rounded-lg" />
        </div>

        <div className="min-w-0">
          <p className="font-condensed text-eyebrow text-fg-subtle uppercase">{eyebrow}</p>
          <h1 className="mt-1 font-display text-display-md text-fg italic sm:text-display-lg">{car.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <TradeTypeBadge type={listing.type} price={listing.price} />
            {!isActive ? <Badge variant="outline">{STATUS_LABEL[listing.status]}</Badge> : null}
          </div>

          {listing.description ? (
            <div className="mt-6">
              <h2 className="text-h3 text-fg">Detalhes</h2>
              <p className="mt-1.5 text-body text-fg-muted whitespace-pre-wrap">{listing.description}</p>
            </div>
          ) : null}

          {listing.type === "TRADE" && listing.desiredCars.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-h3 text-fg">Procura na troca</h2>
              <div className="mt-2 space-y-2">
                {listing.desiredCars.map((desired) => (
                  <div key={desired.id} className="flex items-center gap-3">
                    <CarThumb fileId={desired.imageFileId} alt={desired.title} iconSize={16} className="size-10 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm text-fg">{desired.title}</p>
                      <p className="truncate text-caption text-fg-subtle">{desired.serieTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <p className="mt-6 text-caption text-fg-subtle">Anunciado por {listing.userName}</p>

          {/* Ações (desktop) */}
          <div className="mt-6 hidden lg:block">
            <AnuncioActions
              isOwner={isOwner}
              isActive={isActive}
              listing={listing}
              phone={phone}
              revealing={revealing}
              onReveal={handleReveal}
              onOpenComplete={() => setCompleteOpen(true)}
              onOpenCancel={() => setCancelOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Ações (celular, barra fixa) */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <AnuncioActions
          isOwner={isOwner}
          isActive={isActive}
          listing={listing}
          phone={phone}
          revealing={revealing}
          onReveal={handleReveal}
          onOpenComplete={() => setCompleteOpen(true)}
          onOpenCancel={() => setCancelOpen(true)}
        />
      </div>

      <ConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Finalizar anúncio?"
        confirmLabel="Finalizar"
        tone="primary"
        loading={completing}
        onConfirm={() => void handleComplete()}
      >
        Marca a troca ou venda como concluída. Não dá para reabrir depois.
      </ConfirmDialog>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancelar anúncio?"
        confirmLabel="Cancelar anúncio"
        loading={cancelling}
        onConfirm={() => void handleCancel()}
      >
        O anúncio sai da vitrine sem ser concluído.
      </ConfirmDialog>
    </div>
  );
}

function AnuncioActions({
  isOwner,
  isActive,
  listing,
  phone,
  revealing,
  onReveal,
  onOpenComplete,
  onOpenCancel,
}: {
  isOwner: boolean;
  isActive: boolean;
  listing: TradeListing;
  phone: string | null | undefined;
  revealing: boolean;
  onReveal: () => void;
  onOpenComplete: () => void;
  onOpenCancel: () => void;
}) {
  if (isOwner) {
    if (!isActive) {
      return (
        <p className="text-center text-body-sm text-fg-muted">
          {listing.status === "COMPLETED" ? "Você finalizou este anúncio." : "Você cancelou este anúncio."}
        </p>
      );
    }
    return (
      <div className="flex gap-2">
        <Button variant="outline" fullWidth className="flex-1" onClick={onOpenCancel}>
          Cancelar
        </Button>
        <Button fullWidth className="flex-1" onClick={onOpenComplete}>
          Finalizar
        </Button>
      </div>
    );
  }

  if (!isActive) {
    return (
      <p className="text-center text-body-sm text-fg-muted">
        {listing.status === "COMPLETED" ? "Este anúncio já foi concluído." : "Este anúncio foi cancelado."}
      </p>
    );
  }

  if (phone !== undefined) {
    if (phone) {
      const message = `Oi! Vi seu anúncio do ${listing.car.title} no ToSave...`;
      return (
        <a
          href={whatsappLink(phone, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-13 w-full items-center justify-center gap-2 rounded-md bg-primary text-body-lg font-semibold text-primary-fg transition duration-fast hover:bg-primary-hover"
        >
          <MessageCircle size={20} strokeWidth={1.75} aria-hidden />
          Chamar no WhatsApp
        </a>
      );
    }
    return <p className="text-center text-body-sm text-fg-muted">O anunciante não tem telefone cadastrado.</p>;
  }

  if (!listing.hasContact) {
    return <p className="text-center text-body-sm text-fg-muted">O anunciante não tem telefone cadastrado.</p>;
  }

  return (
    <Button fullWidth size="lg" leftIcon={Phone} loading={revealing} onClick={onReveal}>
      Revelar contato
    </Button>
  );
}
