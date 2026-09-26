import Link from "next/link";
import { CarThumb } from "@/components/admin/car-thumb";
import type { CarItem } from "@/lib/public-api";
import { slugify } from "@/lib/slug";

/** Card da vitrine pública (componentes.md §6, variante `catalog`, sem favorito nem posse). */
export function CarCard({ car, priority }: { car: CarItem; priority?: boolean }) {
  return (
    <Link
      href={`/carros/${car.id}-${slugify(car.title)}`}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-surface shadow-card transition duration-slow ease-out-expo hover:shadow-card-hover hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <div className="relative">
        <CarThumb
          fileId={car.imageFileId}
          alt={car.title}
          iconSize={36}
          priority={priority}
          className="aspect-card rounded-t-lg transition-transform duration-slow group-hover:scale-[1.04]"
        />
        {car.toy ? (
          <span className="absolute top-2 left-2 inline-flex h-6 items-center rounded-xs bg-accent-soft px-2 font-mono text-caption text-accent">
            {car.toy}
          </span>
        ) : null}
        {car.seriePosition ? (
          <span className="absolute right-2 bottom-2 inline-flex h-6 items-center rounded-xs bg-black/50 px-2 font-mono text-caption text-white backdrop-blur">
            {car.seriePosition}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-3 sm:p-4">
        <p className="truncate font-condensed text-eyebrow text-fg-subtle uppercase">
          {[car.brandName, car.year || null].filter(Boolean).join(" · ") || "—"}
        </p>
        <h3 className="line-clamp-2 text-body font-semibold text-fg">{car.title}</h3>
        <p className="truncate text-body-sm text-fg-muted">{car.serieTitle}</p>
      </div>
    </Link>
  );
}
