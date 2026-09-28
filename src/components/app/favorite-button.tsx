"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";

/** IconButton `glass` especializado (componentes.md §2, FavoriteButton). */
export function FavoriteButton({
  active,
  onToggle,
  className,
  size = "md",
}: {
  active: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "size-8" : "size-9";
  const icon = size === "sm" ? 16 : 18;
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remover da coleção" : "Adicionar à coleção"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "relative z-10 flex items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition duration-fast hover:bg-black/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        box,
        className
      )}
    >
      <Heart
        size={icon}
        strokeWidth={1.75}
        className={cn("transition-transform duration-base", active ? "scale-110 fill-flame text-flame" : "fill-transparent")}
        aria-hidden
      />
    </button>
  );
}
