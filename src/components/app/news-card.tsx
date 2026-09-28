"use client";

import { Newspaper } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { newsImageUrl } from "@/lib/appwrite";
import { cn } from "@/lib/cn";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

function NewsThumb({ fileId, alt, className }: { fileId: string | null; alt: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = newsImageUrl(fileId);
  const showImage = src && failedSrc !== src;
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-card-stage", className)}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- preview do Appwrite já vem redimensionado
        <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} className="size-full object-cover" />
      ) : (
        <Newspaper size={28} strokeWidth={1.5} className="text-fg-subtle/40" aria-hidden />
      )}
    </div>
  );
}

/** Card de notícia (lista `/noticias`), mesmo padrão visual do CarCard. */
export function NewsCard({
  id,
  title,
  summary,
  imageFileId,
  publishedAt,
  className,
}: {
  id: string;
  title: string;
  summary: string;
  imageFileId: string | null;
  publishedAt: string;
  className?: string;
}) {
  return (
    <Link
      href={`/noticia/${id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg bg-surface shadow-card transition duration-slow ease-out-expo hover:shadow-card-hover hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className
      )}
    >
      <NewsThumb fileId={imageFileId} alt="" className="aspect-video rounded-t-lg" />
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="font-condensed text-eyebrow text-fg-subtle uppercase">{dateFormatter.format(new Date(publishedAt))}</p>
        <h3 className="line-clamp-2 text-body font-semibold text-fg">{title}</h3>
        <p className="line-clamp-2 text-body-sm text-fg-muted">{summary}</p>
      </div>
    </Link>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-surface shadow-card">
      <div className="skeleton aspect-video rounded-t-lg rounded-b-none" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-full" />
      </div>
    </div>
  );
}

export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}
