"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Badge } from "./badge";

export type TabItem = { value: string; label: string; count?: number; href: string };

/** Tabs com estado na URL (componentes.md §13). */
export function Tabs({ items, active }: { items: TabItem[]; active: string }) {
  return (
    <nav aria-label="Abas" className="flex overflow-x-auto border-b border-border">
      {items.map((item) => {
        const isActive = item.value === active;
        return (
          <Link
            key={item.value}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex h-11 flex-1 shrink-0 items-center justify-center gap-2 px-4 text-body-sm font-medium whitespace-nowrap sm:flex-none",
              isActive ? "text-fg" : "text-fg-muted hover:text-fg"
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <Badge variant="outline" size="sm">
                {item.count}
              </Badge>
            ) : null}
            {isActive ? <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 bg-flame" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
