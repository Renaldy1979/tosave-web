"use client";

import { cn } from "@/lib/cn";

export type SegmentedOption<T extends string> = { value: T; label: string };

/** Container `bg-surface-2 rounded-md p-1` (componentes.md §13). */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  disabled,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex h-9 items-center gap-1 rounded-md bg-surface-2 p-1", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "h-7 rounded-sm px-3 text-body-sm transition duration-fast disabled:cursor-not-allowed disabled:opacity-50",
            value === opt.value ? "bg-surface-3 text-fg shadow-card" : "text-fg-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
