import Link from "next/link";
import { CarThumb } from "@/components/admin/car-thumb";
import { Badge } from "@/components/ui/badge";
import type { CarItem } from "@/lib/app-types";
import { cn } from "@/lib/cn";
import { FavoriteButton } from "./favorite-button";
import { QuantityStepper } from "./quantity-stepper";

type CarCardProps = {
  car: CarItem;
  variant?: "catalog" | "collection" | "compact";
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  quantity?: number;
  onChangeQuantity?: (next: number) => void;
  priority?: boolean;
  className?: string;
};

/** CarCard do app do colecionador (componentes.md §6): imagem domina, texto é legenda. */
export function CarCard({
  car,
  variant = "catalog",
  isFavorite = false,
  onToggleFavorite,
  quantity = 0,
  onChangeQuantity,
  priority,
  className,
}: CarCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/car/${car.id}`}
        className="group flex items-center gap-3 rounded-lg p-2 transition duration-fast hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CarThumb fileId={car.imageFileId} alt={car.title} iconSize={20} className="size-14 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-semibold text-fg">{car.title}</p>
          <p className="truncate font-mono text-caption text-fg-subtle">{car.toy}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/car/${car.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-surface shadow-card transition duration-slow ease-out-expo hover:shadow-card-hover hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className
      )}
    >
      <div className="relative">
        <CarThumb
          fileId={car.imageFileId}
          alt={car.title}
          iconSize={36}
          priority={priority}
          className="aspect-card rounded-t-lg transition-transform duration-slow group-hover:scale-[1.04]"
        />
        <span className="absolute top-2 left-2 inline-flex h-6 items-center rounded-xs bg-accent-soft px-2 font-mono text-caption text-accent">
          #{car.collector}
        </span>
        {variant === "collection" ? (
          <QuantityStepper quantity={quantity} onChange={(next) => onChangeQuantity?.(next)} className="absolute top-2 right-2" />
        ) : (
          <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite?.()} className="absolute top-2 right-2" />
        )}
        {car.seriePosition ? (
          <span className="absolute right-2 bottom-2 inline-flex h-6 items-center rounded-xs bg-black/50 px-2 font-mono text-caption text-white backdrop-blur">
            {car.seriePosition}
          </span>
        ) : null}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-flame transition-transform duration-slow group-hover:scale-x-100"
        />
      </div>
      <div className="space-y-1 p-3 sm:p-4">
        <p className="truncate font-condensed text-eyebrow text-fg-subtle uppercase">
          {[car.brandName, car.year].filter(Boolean).join(" · ")}
        </p>
        <h3 className="line-clamp-2 text-body-sm font-semibold text-fg sm:text-body">{car.title}</h3>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-body-sm text-fg-muted">{car.serieTitle}</p>
          <p className="hidden shrink-0 font-mono text-caption text-fg-subtle sm:block">{car.toy}</p>
        </div>
        {variant === "collection" && quantity > 1 ? (
          <Badge variant="flame" size="sm">
            Repetido ×{quantity}
          </Badge>
        ) : null}
      </div>
    </Link>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-surface shadow-card">
      <div className="skeleton aspect-card rounded-t-lg rounded-b-none" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}

export function CarGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  );
}
