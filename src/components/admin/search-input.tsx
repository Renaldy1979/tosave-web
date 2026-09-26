"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fieldClass } from "@/components/ui/input";
import { cn } from "@/lib/cn";

/** Busca com debounce de 300 ms; Enter aplica na hora. Atalho "/" foca no desktop. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Valor externo mudou (voltar no histórico, "limpar filtros").
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onChangeRef.current(draft), 300);
    return () => clearTimeout(timer);
  }, [draft, value]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (e.key !== "/" || !target || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable) return;
      e.preventDefault();
      ref.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle" aria-hidden />
      <input
        ref={ref}
        type="search"
        aria-label={label}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onChange(draft);
          if (e.key === "Escape" && draft) setDraft("");
        }}
        className={cn(fieldClass, "pr-16 pl-10 [&::-webkit-search-cancel-button]:hidden")}
      />
      {draft ? (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => {
            setDraft("");
            onChange("");
            ref.current?.focus();
          }}
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-fg-subtle hover:bg-surface-3 hover:text-fg"
        >
          <X size={16} />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-xs border border-border px-1.5 font-mono text-caption text-fg-subtle lg:block">
          /
        </kbd>
      )}
    </div>
  );
}
