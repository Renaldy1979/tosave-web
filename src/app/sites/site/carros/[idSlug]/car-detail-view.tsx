import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { CarThumb } from "@/components/admin/car-thumb";
import { ButtonLink } from "@/components/ui/button";
import { APP_URL } from "@/lib/env";
import type { PublicCarDetail } from "@/lib/public-api";

export function CarDetailView({ car }: { car: PublicCarDetail }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-5 md:px-6 lg:px-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-body-sm text-fg-subtle">
        <Link href="/vitrine" className="hover:text-fg">
          Vitrine
        </Link>
        <ChevronRight size={14} strokeWidth={1.75} aria-hidden />
        <span className="truncate text-fg-muted">{car.title}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative">
          <CarThumb
            fileId={car.imageFileId}
            alt={car.title}
            size="full"
            iconSize={64}
            priority
            className="aspect-card rounded-lg shadow-card"
          />
          {car.toy ? (
            <span className="absolute top-3 left-3 inline-flex h-7 items-center rounded-xs bg-accent-soft px-2.5 font-mono text-body-sm text-accent">
              {car.toy}
            </span>
          ) : null}
          {car.seriePosition ? (
            <span className="absolute right-3 bottom-3 inline-flex h-7 items-center rounded-xs bg-black/50 px-2.5 font-mono text-body-sm text-white backdrop-blur">
              {car.seriePosition}
            </span>
          ) : null}
        </div>

        <div>
          <p className="font-condensed text-eyebrow text-primary-text uppercase">
            {[car.brand.name, car.year || null].filter(Boolean).join(" · ") || "—"}
          </p>
          <h1 className="mt-2 font-display text-display-lg text-fg italic">{car.title}</h1>
          <p className="mt-2 text-body text-fg-muted">{car.serie.title}</p>

          {car.description.trim() ? <p className="mt-5 text-body text-fg-muted">{car.description.trim()}</p> : null}

          {car.attributes.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {car.attributes.map((a) => (
                <span key={a.id} title={a.description ?? undefined} className="inline-flex h-7 items-center rounded-sm bg-surface-3 px-3 text-body-sm text-fg-muted">
                  {a.title}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8">
            <ButtonLink href={`${APP_URL}/cadastro`} variant="flame" size="lg">
              Adicionar à sua coleção
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
