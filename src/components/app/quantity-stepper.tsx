"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/** `– n +` glass, componentes.md §13. */
export function QuantityStepper({
  quantity,
  onChange,
  className,
  variant = "glass",
}: {
  quantity: number;
  onChange: (next: number) => void;
  className?: string;
  variant?: "glass" | "secondary";
}) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-8 items-center gap-1 rounded-full px-1 font-mono text-body-sm",
        variant === "glass" ? "bg-black/45 text-white backdrop-blur-md" : "bg-surface-3 text-fg",
        className
      )}
    >
      <button
        type="button"
        aria-label="Diminuir quantidade"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(quantity - 1);
        }}
        className="flex size-6 items-center justify-center rounded-full transition duration-fast hover:bg-white/15"
      >
        <Minus size={14} strokeWidth={2} aria-hidden />
      </button>
      <span className="w-4 text-center tabular-nums">{quantity}</span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(quantity + 1);
        }}
        className="flex size-6 items-center justify-center rounded-full transition duration-fast hover:bg-white/15"
      >
        <Plus size={14} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
