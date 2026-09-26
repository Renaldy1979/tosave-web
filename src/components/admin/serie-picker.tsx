"use client";

import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { AdminSerie } from "@/lib/admin-types";
import { searchSeries } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export type SerieOption = { id: string; name: string };

type SeriePickerProps = {
  value: SerieOption | null;
  onChange: (value: SerieOption | null) => void;
  placeholder?: string;
  /** Mostra o "x" para limpar (filtros). */
  clearable?: boolean;
  invalid?: boolean;
  id?: string;
  describedBy?: string;
  disabled?: boolean;
};

/** Combobox de série com busca no servidor (são centenas de séries). */
export function SeriePicker({
  value,
  onChange,
  placeholder = "Escolha a série",
  clearable,
  invalid,
  id,
  describedBy,
  disabled,
}: SeriePickerProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<AdminSerie[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setFailed(false);
      searchSeries(q, controller.signal)
        .then((page) => {
          setItems(page.items);
          setActive(0);
        })
        .catch(() => {
          if (!controller.signal.aborted) setFailed(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, open]);

  function choose(serie: AdminSerie) {
    onChange({ id: serie.id, name: serie.name });
    setOpen(false);
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setQ("");
      }}
    >
      <div className="relative">
        <Popover.Trigger asChild disabled={disabled}>
          <button
            type="button"
            id={id}
            data-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              "flex h-11 w-full items-center rounded-md border border-border-strong bg-surface-2 pr-10 pl-3.5 text-left text-body",
              "transition duration-fast hover:border-fg-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15",
              "disabled:cursor-not-allowed disabled:opacity-50 data-[invalid=true]:border-danger data-[state=open]:border-primary",
              value ? "text-fg" : "text-fg-subtle"
            )}
          >
            <span className="truncate">{value?.name ?? placeholder}</span>
          </button>
        </Popover.Trigger>
        {clearable && value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Limpar série"
            className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-fg-subtle hover:bg-surface-3 hover:text-fg"
          >
            <X size={16} />
          </button>
        ) : (
          <ChevronDown
            size={18}
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle"
            aria-hidden
          />
        )}
      </div>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-72 animate-fade-in rounded-lg bg-surface p-1.5 shadow-pop"
        >
          <div className="relative mb-1.5">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, items.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (items[active]) choose(items[active]);
                }
              }}
              placeholder="Buscar série…"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={items[active] ? `${listId}-${items[active].id}` : undefined}
              className="h-10 w-full rounded-md bg-surface-2 pr-3 pl-9 text-body-sm text-fg placeholder:text-fg-subtle focus:outline-none"
            />
          </div>
          <ul id={listId} role="listbox" className="max-h-72 overflow-y-auto">
            {loading && !items.length ? (
              <li className="flex items-center justify-center py-6 text-fg-subtle">
                <Loader2 size={18} className="animate-spin" aria-label="Carregando" />
              </li>
            ) : failed ? (
              <li className="px-3 py-6 text-center text-body-sm text-danger">Não foi possível buscar as séries.</li>
            ) : !items.length ? (
              <li className="px-3 py-6 text-center text-body-sm text-fg-subtle">Nenhum conteúdo disponível.</li>
            ) : (
              items.map((serie, i) => {
                const selected = serie.id === value?.id;
                return (
                  <li
                    key={serie.id}
                    id={`${listId}-${serie.id}`}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(serie)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-body-sm",
                      i === active ? "bg-surface-3 text-fg" : "text-fg-muted"
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{serie.name}</span>
                    <span className="shrink-0 font-mono text-caption text-fg-subtle">{serie.carCount}</span>
                    {selected ? <Check size={16} className="shrink-0 text-primary-text" aria-hidden /> : null}
                  </li>
                );
              })
            )}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
