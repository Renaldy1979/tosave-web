"use client";

import Link from "next/link";
import { CarThumb } from "@/components/admin/car-thumb";
import { Badge } from "@/components/ui/badge";
import type { TradeListing, TradeStatus, TradeType } from "@/lib/app-types";
import { cn } from "@/lib/cn";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_LABEL: Record<TradeStatus, string> = {
  ACTIVE: "",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

/** Badge "Troca" ou "Venda · R$ X". */
export function TradeTypeBadge({ type, price }: { type: TradeType; price: number | null }) {
  if (type === "SALE") {
    return <Badge variant="accent">{price !== null ? currencyFormatter.format(price) : "Venda"}</Badge>;
  }
  return <Badge variant="primary">Troca</Badge>;
}

/** Card de anúncio (vitrine e "Meus anúncios"), mesmo padrão do CarCard. */
export function TradeListingCard({ listing, className }: { listing: TradeListing; className?: string }) {
  const car = listing.car;
  const subtitle = [car.serieTitle, car.toy].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/anuncio/${listing.id}`}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition duration-fast hover:border-primary/40 hover:bg-surface-3/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <CarThumb fileId={car.imageFileId} alt={car.title} iconSize={22} className="size-16 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-body font-semibold text-fg">{car.title}</h3>
        <p className="truncate text-caption text-fg-subtle">{subtitle}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <TradeTypeBadge type={listing.type} price={listing.price} />
          {listing.status !== "ACTIVE" ? (
            <Badge variant="outline" size="sm">
              {STATUS_LABEL[listing.status]}
            </Badge>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function TradeListingCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
      <div className="skeleton size-16 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton h-4 w-3/5" />
        <div className="skeleton h-3 w-2/5" />
        <div className="skeleton h-5 w-20 rounded-xs" />
      </div>
    </div>
  );
}
