"use client";

import Link from "next/link";
import { SerieLogo } from "@/components/app/serie-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

/** "37%" · "< 1%" (maior que zero) · "0%". */
export function percentLabel(owned: number, total: number): string {
  if (owned <= 0 || total <= 0) return "0";
  const pct = (owned / total) * 100;
  if (pct < 1) return "< 1";
  return String(Math.round(pct));
}

export function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("h-1.5 overflow-hidden rounded-full bg-surface-3", className)}
    >
      <div className="h-full rounded-full bg-flame transition-[width] duration-slow" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Linha de progresso (série ou ano), reaproveitada na Home/Perfil futuramente. */
export function ProgressRow({
  href,
  title,
  owned,
  total,
  imageFileId,
  titleIsYear,
}: {
  href: string;
  title: string;
  owned: number;
  total: number;
  imageFileId?: string | null;
  titleIsYear?: boolean;
}) {
  const complete = total > 0 && owned >= total;
  return (
    <Link
      href={href}
      className="flex items-center gap-3 border-b border-border px-3.5 py-3 transition duration-fast last:border-b-0 hover:bg-surface-3/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      {imageFileId !== undefined ? <SerieLogo fileId={imageFileId} alt="" iconSize={18} className="size-9 shrink-0 rounded-sm" /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("truncate text-body-sm text-fg", titleIsYear ? "font-display font-bold" : "font-medium")}>{title}</p>
          <span className="shrink-0 font-mono text-caption text-fg-subtle">
            {owned}/{total}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <ProgressBar value={owned} max={total} className="flex-1" />
          {complete ? (
            <Badge variant="accent" size="sm">
              Completa
            </Badge>
          ) : (
            <span className="w-8 shrink-0 text-right text-caption text-fg-subtle">{percentLabel(owned, total)}%</span>
          )}
        </div>
      </div>
    </Link>
  );
}
