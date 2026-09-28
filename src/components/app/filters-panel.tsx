"use client";

import type { ReactNode } from "react";
import { NativeSelect } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { Attribute, Brand, Serie } from "@/lib/app-types";
import type { CarFilters } from "@/lib/app-catalog";

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
  series,
  brands,
  years,
  attributes,
  className,
}: {
  filters: CarFilters;
  onChange: (next: CarFilters) => void;
  series: Serie[];
  brands: Brand[];
  years: number[];
  attributes: Attribute[];
  className?: string;
}) {
  const filterYears = filters.years ?? [];
  const filterAttrs = filters.attributeIds ?? [];

  const toggleYear = (year: number) =>
    onChange({ ...filters, years: filterYears.includes(year) ? filterYears.filter((y) => y !== year) : [...filterYears, year] });

  const toggleAttr = (id: string) =>
    onChange({
      ...filters,
      attributeIds: filterAttrs.includes(id) ? filterAttrs.filter((a) => a !== id) : [...filterAttrs, id],
    });

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <p className="mb-2 text-body-sm font-medium text-fg">Série</p>
        <NativeSelect value={filters.serieId ?? ""} onChange={(e) => onChange({ ...filters, serieId: e.target.value || null })}>
          <option value="">Todas as séries</option>
          {series.map((s) => (
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
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div>
        <p className="mb-2 text-body-sm font-medium text-fg">Ano</p>
        <div className="flex flex-wrap gap-1.5">
          {years.map((year) => (
            <Chip key={year} active={filterYears.includes(year)} onClick={() => toggleYear(year)}>
              {year}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-body-sm font-medium text-fg">Atributos</p>
        <div className="flex flex-wrap gap-1.5">
          {attributes.map((attr) => (
            <Chip key={attr.id} active={filterAttrs.includes(attr.id)} onClick={() => toggleAttr(attr.id)}>
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
