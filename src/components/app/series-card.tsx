import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { SerieLogo } from "./serie-logo";

/** Card de série do carrossel "Séries em destaque" (Home). */
export function SeriesCard({
  id,
  title,
  description,
  imageFileId = null,
  carCount,
  ownedCount,
  featured,
  className,
}: {
  id: string;
  title: string;
  description: string;
  imageFileId?: string | null;
  carCount: number;
  ownedCount: number;
  featured?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/series/${id}`}
      className={cn(
        "group relative flex w-[280px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition duration-slow hover:shadow-card-hover hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className
      )}
    >
      <div className="relative h-24">
        <SerieLogo fileId={imageFileId} alt="" className="h-full" />
        {featured ? (
          <Badge variant="flame" size="sm" className="absolute top-2 left-2">
            Em destaque
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-1 text-body font-semibold text-fg">{title}</h3>
        <p className="line-clamp-2 text-body-sm text-fg-muted">{description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-caption text-fg-subtle">
            {ownedCount > 0 ? `Você tem ${ownedCount} de ${carCount}` : `${carCount} miniaturas`}
          </span>
          <ChevronRight size={16} strokeWidth={1.75} className="text-fg-subtle transition-transform duration-fast group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

/** Linha de série na lista `/series` (§SerieRow do app mobile). */
export function SeriesRow({
  id,
  title,
  imageFileId = null,
  carCount,
  ownedCount,
  featured,
}: {
  id: string;
  title: string;
  imageFileId?: string | null;
  carCount: number;
  ownedCount: number;
  featured?: boolean;
}) {
  const complete = carCount > 0 && ownedCount === carCount;
  return (
    <Link
      href={`/series/${id}`}
      className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition duration-fast hover:border-primary/40 hover:bg-surface-3/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <SerieLogo fileId={imageFileId} alt="" iconSize={22} className="size-14 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-body font-semibold text-fg">{title}</h3>
          {featured ? (
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-flame" title="Em destaque" />
          ) : null}
        </div>
        <p className="text-caption text-fg-subtle">
          {complete ? `Série completa · ${carCount}` : ownedCount > 0 ? `Você tem ${ownedCount} de ${carCount}` : `${carCount} miniaturas`}
        </p>
      </div>
      {complete ? (
        <Badge variant="accent" size="sm">
          Completa
        </Badge>
      ) : null}
      <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-fg-subtle" aria-hidden />
    </Link>
  );
}
