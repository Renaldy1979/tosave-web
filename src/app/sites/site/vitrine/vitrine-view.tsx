"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchInput } from "@/components/admin/search-input";
import { CarCard } from "@/components/site/car-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { APP_URL } from "@/lib/env";
import { loadShowcase, type CarItem, type Page } from "@/lib/public-api";

const nf = new Intl.NumberFormat("pt-BR");
const LIMIT = 24;

type Filters = { q: string; serieId: string; serieName: string };

function readFilters(params: URLSearchParams): Filters {
  return { q: params.get("q") ?? "", serieId: params.get("serieId") ?? "", serieName: params.get("serieName") ?? "" };
}

export function VitrineView({ totalCars, initialPage }: { totalCars: number | null; initialPage: Page<CarItem> | null }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = readFilters(params);
  const isDefaultView = filters.q === "" && filters.serieId === "";
  const canUseInitial = isDefaultView && initialPage !== null;

  const [items, setItems] = useState<CarItem[]>(canUseInitial ? initialPage.items : []);
  const [cursor, setCursor] = useState<string | null>(canUseInitial ? initialPage.nextCursor : null);
  const [total, setTotal] = useState<number | null>(canUseInitial ? initialPage.total : null);
  const [loading, setLoading] = useState(!canUseInitial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [moreError, setMoreError] = useState(false);
  const skipNextFetch = useRef(canUseInitial);
  const [retryNonce, setRetryNonce] = useState(0);
  const filtersKey = `${filters.q}::${filters.serieId}`;

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    loadShowcase({ q: filters.q, serieId: filters.serieId, limit: LIMIT })
      .then((page) => {
        if (!alive) return;
        setItems(page.items);
        setCursor(page.nextCursor);
        setTotal(page.total);
      })
      .catch((err: unknown) => {
        if (alive) setError(err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refaz quando os filtros (q/serieId) mudam ou o retry é clicado
  }, [filtersKey, retryNonce]);

  const setFilter = useCallback(
    (patch: Partial<Filters>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (!value) next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [params, pathname, router]
  );

  async function loadMore() {
    setLoadingMore(true);
    setMoreError(false);
    try {
      const page = await loadShowcase({ q: filters.q, serieId: filters.serieId, cursor, limit: LIMIT });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setTotal(page.total);
    } catch {
      setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  const hasAnyFilter = filters.q !== "" || filters.serieId !== "";
  const showSignupBanner = totalCars !== null && total !== null && totalCars > total;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-5 md:px-6 lg:px-8 lg:py-12">
      <h1 className="font-display text-h1 text-fg italic">Vitrine</h1>
      <p className="mt-1 text-body text-fg-muted">Os destaques da comunidade ToSave.</p>

      <div className="sticky top-14 z-30 -mx-4 mt-6 bg-bg/85 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:top-16 lg:-mx-8 lg:px-8">
        <SearchInput
          label="Buscar na vitrine"
          placeholder="Nome ou código toy"
          value={filters.q}
          onChange={(q) => setFilter({ q: q.trim() })}
          className="max-w-xl"
        />
        {filters.serieId ? (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter({ serieId: "", serieName: "" })}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/60 bg-primary-soft px-3 text-body-sm text-primary-text"
            >
              Série: {filters.serieName || "selecionada"}
              <X size={14} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      {showSignupBanner ? (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-lg border border-primary/30 bg-primary-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body-sm text-fg">
            A comunidade tem <strong className="font-mono text-primary-text">{nf.format(totalCars!)}</strong> miniaturas. Cadastre-se
            para ver todas.
          </p>
          <ButtonLink href={`${APP_URL}/cadastro`} size="sm">
            Criar minha coleção
          </ButtonLink>
        </div>
      ) : null}

      <div className="mt-6">
        {error ? (
          <ErrorState onRetry={() => setRetryNonce((n) => n + 1)} message="Não foi possível carregar a vitrine agora." />
        ) : loading ? (
          <ul role="list" aria-busy="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5 lg:gap-6">
            {Array.from({ length: 12 }, (_, i) => (
              <li key={i}>
                <Skeleton className="aspect-card rounded-t-lg" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-1.5 h-3.5 w-1/2" />
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <EmptyState
            kind="no-cars"
            description={hasAnyFilter ? "Tente outro termo ou limpe os filtros." : undefined}
            action={
              hasAnyFilter ? (
                <Button variant="outline" onClick={() => setFilter({ q: "", serieId: "", serieName: "" })}>
                  Limpar filtros
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5 lg:gap-6">
              {items.map((car, i) => (
                <li key={car.id}>
                  <CarCard car={car} priority={i < 4} />
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-body-sm text-fg-subtle">
                Mostrando <span className="font-mono">{nf.format(items.length)}</span>
                {total !== null ? (
                  <>
                    {" "}
                    de <span className="font-mono">{nf.format(total)}</span>
                  </>
                ) : null}
              </p>
              {cursor ? (
                <Button variant="outline" onClick={() => void loadMore()} loading={loadingMore}>
                  Carregar mais
                </Button>
              ) : (
                <p className="text-caption text-fg-subtle">Você viu tudo.</p>
              )}
              {moreError ? <p className="text-caption text-danger">Não foi possível carregar mais. Tente de novo.</p> : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
