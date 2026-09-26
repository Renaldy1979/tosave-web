"use client";

import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/admin/admin-shell";
import { CarThumb } from "@/components/admin/car-thumb";
import { SearchInput } from "@/components/admin/search-input";
import { SeriePicker, type SerieOption } from "@/components/admin/serie-picker";
import { Button, ButtonLink, buttonVariants } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { NativeSelect } from "@/components/ui/select";
import type { AdminAttribute, AdminBrand, AdminCar, Page } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { loadAttributes, loadBrands, loadSerie, loadYears } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { useApi } from "@/lib/use-api";

const nf = new Intl.NumberFormat("pt-BR");
const PAGE_SIZES = [20, 50, 100] as const;

type Filters = {
  q: string;
  serieId: string;
  brandId: string;
  year: string;
  attr: string;
  hasImage: "" | "true" | "false";
  limit: number;
};

function readFilters(params: URLSearchParams): Filters {
  const hasImage = params.get("hasImage");
  const limit = Number(params.get("limit"));
  return {
    q: params.get("q") ?? "",
    serieId: params.get("serieId") ?? "",
    brandId: params.get("brandId") ?? "",
    year: params.get("year") ?? "",
    attr: params.get("attr") ?? "",
    hasImage: hasImage === "true" || hasImage === "false" ? hasImage : "",
    limit: (PAGE_SIZES as readonly number[]).includes(limit) ? limit : 20,
  };
}

type Options = { brands: AdminBrand[]; attributes: AdminAttribute[]; years: number[] };

async function loadOptions(): Promise<Options> {
  const [brands, attributes, years] = await Promise.all([loadBrands(), loadAttributes(), loadYears()]);
  return { brands, attributes, years };
}

export function CarsList() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useMemo(() => readFilters(new URLSearchParams(params.toString())), [params]);
  const [showFilters, setShowFilters] = useState(false);
  const options = useApi("car-options", loadOptions);

  // Nome da série do filtro (a URL só guarda o id).
  const [serie, setSerie] = useState<SerieOption | null>(null);
  useEffect(() => {
    if (!filters.serieId) return;
    if (serie?.id === filters.serieId) return;
    let alive = true;
    loadSerie(filters.serieId)
      .then((s) => alive && setSerie({ id: s.id, name: s.name }))
      .catch(() => alive && setSerie({ id: filters.serieId, name: "Série" }));
    return () => {
      alive = false;
    };
  }, [filters.serieId, serie?.id]);

  const setFilter = useCallback(
    (patch: Partial<Filters>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === "" || v === undefined || (k === "limit" && v === 20)) next.delete(k);
        else next.set(k, String(v));
      }
      const qs = next.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const activeCount = [filters.serieId, filters.brandId, filters.year, filters.attr, filters.hasImage].filter(Boolean).length;
  const hasAnyFilter = activeCount > 0 || filters.q !== "";
  const filtersKey = JSON.stringify(filters);

  return (
    <>
      <PageHeader
        title="Miniaturas"
        breadcrumb="Catálogo"
        actions={
          <ButtonLink href="/cars/new" leftIcon={Plus} size="sm" className="sm:h-11 sm:px-4 sm:text-body">
            Nova miniatura
          </ButtonLink>
        }
      />

      <div className="mb-5 space-y-3">
        <div className="flex gap-2">
          <SearchInput
            className="flex-1"
            label="Buscar miniaturas"
            placeholder="Nome, código toy ou nº de coleção"
            value={filters.q}
            onChange={(q) => setFilter({ q: q.trim() })}
          />
          <Button
            variant="outline"
            className="relative size-11 px-0 lg:hidden"
            aria-label="Filtros"
            aria-expanded={showFilters}
            onClick={() => setShowFilters((s) => !s)}
          >
            <SlidersHorizontal size={18} strokeWidth={1.75} />
            {activeCount ? (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary font-mono text-[10px] text-primary-fg">
                {activeCount}
              </span>
            ) : null}
          </Button>
        </div>

        <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5", !showFilters && "hidden lg:grid")}>
          <SeriePicker
            placeholder="Todas as séries"
            clearable
            value={filters.serieId ? serie : null}
            onChange={(s) => {
              setSerie(s);
              setFilter({ serieId: s?.id ?? "" });
            }}
          />
          <NativeSelect aria-label="Marca" value={filters.brandId} onChange={(e) => setFilter({ brandId: e.target.value })}>
            <option value="">Todas as marcas</option>
            {options.data?.brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect aria-label="Ano" value={filters.year} onChange={(e) => setFilter({ year: e.target.value })}>
            <option value="">Todos os anos</option>
            {options.data?.years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect aria-label="Atributo" value={filters.attr} onChange={(e) => setFilter({ attr: e.target.value })}>
            <option value="">Todos os atributos</option>
            {options.data?.attributes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect
            aria-label="Foto"
            value={filters.hasImage}
            onChange={(e) => setFilter({ hasImage: e.target.value as Filters["hasImage"] })}
          >
            <option value="">Com e sem foto</option>
            <option value="true">Com foto</option>
            <option value="false">Sem foto</option>
          </NativeSelect>
        </div>
        {hasAnyFilter ? (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="text-body-sm font-medium text-primary-text hover:underline"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      <CarsTable key={filtersKey} filters={filters} hasAnyFilter={hasAnyFilter} onLimit={(limit) => setFilter({ limit })} />
    </>
  );
}

function CarsTable({
  filters,
  hasAnyFilter,
  onLimit,
}: {
  filters: Filters;
  hasAnyFilter: boolean;
  onLimit: (limit: number) => void;
}) {
  const router = useRouter();
  // Paginação por cursor: pilha com o cursor de cada página já visitada.
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const cursor = cursors[pageIndex];

  const { data, error, loading, reload } = useApi<Page<AdminCar>>(`cars:${pageIndex}:${cursor ?? ""}`, (signal) =>
    api<Page<AdminCar>>("/admin/cars", {
      query: {
        q: filters.q,
        serieId: filters.serieId,
        brandId: filters.brandId,
        years: filters.year,
        attributeIds: filters.attr,
        hasImage: filters.hasImage,
        limit: filters.limit,
        cursor,
      },
      signal,
    })
  );

  if (error) return <ErrorState onRetry={reload} />;

  if (loading || !data) {
    return (
      <div aria-busy="true" className="overflow-hidden rounded-lg bg-surface shadow-card">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
            <Skeleton className="h-[54px] w-[72px] shrink-0 md:h-[42px] md:w-[56px]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data.items.length && pageIndex === 0) {
    return (
      <div className="rounded-lg bg-surface shadow-card">
        {hasAnyFilter ? (
          <EmptyState kind="no-cars" description="Tente outro termo ou limpe os filtros." />
        ) : (
          <EmptyState
            kind="no-cars"
            action={
              <ButtonLink href="/cars/new" leftIcon={Plus}>
                Cadastrar miniatura
              </ButtonLink>
            }
          />
        )}
      </div>
    );
  }

  const shownTotal = data.total ?? total;
  const from = pageIndex * filters.limit + 1;
  const to = pageIndex * filters.limit + data.items.length;
  const editHref = (car: AdminCar) => `/cars/${car.id}/edit`;

  return (
    <div>
      {/* Desktop: tabela */}
      <div className="hidden overflow-hidden rounded-lg bg-surface shadow-card md:block">
        <table className="w-full text-left">
          <thead className="bg-surface-2">
            <tr className="font-condensed text-eyebrow text-fg-subtle uppercase">
              <th className="w-[88px] py-3 pl-4 font-semibold" scope="col">
                <span className="sr-only">Foto</span>
              </th>
              <th className="py-3 pr-4 font-semibold" scope="col">Miniatura</th>
              <th className="py-3 pr-4 font-semibold" scope="col">Código</th>
              <th className="py-3 pr-4 font-semibold" scope="col">Série</th>
              <th className="py-3 pr-4 font-semibold" scope="col">Ano</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((car) => (
              <tr
                key={car.id}
                onClick={() => router.push(editHref(car))}
                className="cursor-pointer border-t border-border transition duration-fast hover:bg-surface-3/50"
              >
                <td className="py-2.5 pl-4">
                  <CarThumb fileId={car.imageFileId} alt="" className="h-[42px] w-[56px] rounded-md" iconSize={18} />
                </td>
                <td className="py-2.5 pr-4">
                  <Link
                    href={editHref(car)}
                    onClick={(e) => e.stopPropagation()}
                    className="line-clamp-1 font-medium text-fg hover:text-primary-text focus-visible:underline focus-visible:outline-none"
                  >
                    {car.name}
                  </Link>
                  <p className="text-body-sm text-fg-subtle">
                    {[car.brand, car.collector ? `#${car.collector}` : null, car.seriePosition].filter(Boolean).join(" · ") || "—"}
                  </p>
                </td>
                <td className="py-2.5 pr-4 font-mono text-body-sm text-fg-muted">{car.toy || "—"}</td>
                <td className="max-w-[240px] py-2.5 pr-4">
                  <span className="inline-flex h-6 max-w-full items-center truncate rounded-xs bg-primary-soft px-2 text-caption font-medium text-primary-text">
                    <span className="truncate">{car.serieName}</span>
                  </span>
                </td>
                <td className="py-2.5 pr-4 font-mono text-body-sm text-fg-muted">{car.year || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular: linhas-cartão */}
      <ul className="space-y-2 md:hidden">
        {data.items.map((car) => (
          <li key={car.id}>
            <Link
              href={editHref(car)}
              className="flex items-center gap-3 rounded-lg bg-surface p-2.5 shadow-card active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CarThumb fileId={car.imageFileId} alt="" className="h-[54px] w-[72px] shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-body-sm font-semibold text-fg">{car.name}</p>
                <p className="truncate font-mono text-caption text-fg-subtle">
                  {[car.toy, car.year].filter(Boolean).join(" · ") || car.serieName}
                </p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-fg-subtle" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <nav aria-label="Paginação" className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-sm text-fg-subtle">
          {nf.format(from)}–{nf.format(to)}
          {shownTotal !== null ? ` de ${nf.format(shownTotal)}` : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((i) => i - 1)}
            className={buttonVariants({ variant: "outline", size: "icon", className: "size-9" })}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[88px] text-center text-body-sm text-fg-muted">
            Página {pageIndex + 1}
            {shownTotal !== null ? ` de ${Math.max(1, Math.ceil(shownTotal / filters.limit))}` : ""}
          </span>
          <button
            type="button"
            aria-label="Próxima página"
            disabled={!data.nextCursor}
            onClick={() => {
              if (data.total !== null) setTotal(data.total);
              setCursors((stack) => [...stack.slice(0, pageIndex + 1), data.nextCursor]);
              setPageIndex((i) => i + 1);
            }}
            className={buttonVariants({ variant: "outline", size: "icon", className: "size-9" })}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <NativeSelect
          aria-label="Itens por página"
          className="hidden w-40 sm:block"
          value={String(filters.limit)}
          onChange={(e) => onLimit(Number(e.target.value))}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </NativeSelect>
      </nav>
    </div>
  );
}
