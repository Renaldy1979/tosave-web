"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const nf = new Intl.NumberFormat("pt-BR");

/** Paginação `numbered` simplificada para prev/next (a API é por cursor, sem acesso aleatório). */
export function Pager({
  pageIndex,
  limit,
  count,
  total,
  hasNext,
  onPrev,
  onNext,
}: {
  pageIndex: number;
  limit: number;
  count: number;
  total: number | null;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (pageIndex === 0 && !hasNext) return null;
  const from = pageIndex * limit + 1;
  const to = pageIndex * limit + count;
  return (
    <nav aria-label="Paginação" className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-body-sm text-fg-subtle">
        {nf.format(from)}–{nf.format(to)}
        {total !== null ? ` de ${nf.format(total)}` : ""}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={pageIndex === 0}
          onClick={onPrev}
          className={buttonVariants({ variant: "outline", size: "icon", className: "size-9" })}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="min-w-[88px] text-center text-body-sm text-fg-muted">
          Página {pageIndex + 1}
          {total !== null ? ` de ${Math.max(1, Math.ceil(total / limit))}` : ""}
        </span>
        <button
          type="button"
          aria-label="Próxima página"
          disabled={!hasNext}
          onClick={onNext}
          className={buttonVariants({ variant: "outline", size: "icon", className: "size-9" })}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
