"use client";

import type { ReactNode } from "react";
import { NativeSelect } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { MOCK_ATTRIBUTES, MOCK_BRANDS, MOCK_SERIES } from "@/app/sites/app/_mock/data";
import { ALL_YEARS, type CarFilters } from "@/app/sites/app/_mock/filter";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-9 items-center rounded-md border px-3 text-body-sm transition duration-fast",
        active ? "border-primary/60 bg-primary-soft text-primary-text" : "border-border-strong text-fg-muted hover:border-fg-subtle hover:text-fg"
      )}
    >
      {children}
    </button>
  );
}

/** Painel de filtros do catálogo (componentes.md §12) — aside no desktop, sheet no celular. */
export function FiltersPanel({
  filters,
  onChange,
  className,
}: {
  filters: CarFilters;
  onChange: (next: CarFilters) => void;
  className?: string;
}) {
  const toggleYear = (year: number) =>
    onChange({ ...filters, years: filters.years.includes(year) ? filters.years.filter((y) => y !== year) : [...filters.years, year] });

  const toggleAttr = (id: string) =>
    onChange({
      ...filters,
      attributeIds: filters.attributeIds.includes(id) ? filters.attributeIds.filter((a) => a !== id) : [...filters.attributeIds, id],
    });

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <p className="mb-2 text-body-sm font-medium text-fg">Série</p>
        <NativeSelect value={filters.serieId ?? ""} onChange={(e) => onChange({ ...filters, serieId: e.target.value || null })}>
          <option value="">Todas as séries</option>
          {MOCK_SERIES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div>
        <p className="mb-2 text-body-sm font-medium text-fg">Marca</p>
        <NativeSelect value={filters.brandId ?? ""} onChange={(e) => onChange({ ...filters, brandId: e.target.value || null })}>
          <option value="">Todas as marcas</option>
          {MOCK_BRANDS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div>
        <p className="mb-2 text-body-sm font-medium text-fg">Ano</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_YEARS.map((year) => (
            <Chip key={year} active={filters.years.includes(year)} onClick={() => toggleYear(year)}>
              {year}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-body-sm font-medium text-fg">Atributos</p>
        <div className="flex flex-wrap gap-1.5">
          {MOCK_ATTRIBUTES.map((attr) => (
            <Chip key={attr.id} active={filters.attributeIds.includes(attr.id)} onClick={() => toggleAttr(attr.id)}>
              {attr.title}
            </Chip>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange({ q: filters.q, years: [], serieId: null, brandId: null, attributeIds: [] })}
        className="text-body-sm font-medium text-primary-text hover:underline"
      >
        Limpar filtros
      </button>
    </div>
  );
}
