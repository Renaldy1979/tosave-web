"use client";

import * as Popover from "@radix-ui/react-popover";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export type KebabItem = {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
};

/** Menu "⋯" de ações de linha/card (componentes.md §7 AdminShell, §13 DataTable). */
export function KebabMenu({ items, label = "Ações" }: { items: KebabItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
          className="flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-surface-3 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreHorizontal size={18} strokeWidth={1.75} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          onClick={(e) => e.stopPropagation()}
          className="z-50 w-48 animate-fade-in rounded-lg bg-surface p-1 shadow-pop"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-body-sm transition duration-fast",
                "disabled:pointer-events-none disabled:opacity-40",
                item.danger ? "text-danger hover:bg-danger/10" : "text-fg hover:bg-surface-3"
              )}
            >
              <item.icon size={16} strokeWidth={1.75} aria-hidden />
              {item.label}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
