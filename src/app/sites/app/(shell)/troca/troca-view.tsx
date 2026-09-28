"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { listMyTradeMock, listTradeMock } from "@/app/sites/app/_mock/trade";
import { LoadMore } from "@/components/app/load-more";
import { TradeListingCard, TradeListingCardSkeleton } from "@/components/app/trade-listing-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { fieldClass } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented";
import type { TradeListing, TradeType } from "@/lib/app-types";
import { useMe } from "@/lib/auth";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useInfiniteList } from "@/lib/use-infinite-list";

const PAGE_SIZE = 12;

type Tab = "vitrine" | "meus";
type TypeFilter = "all" | TradeType;

function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <TradeListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TrocaView() {
  const [tab, setTab] = useState<Tab>("vitrine");

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">Clube da Troca</h1>
        <ButtonLink href="/anuncio/novo" leftIcon={Plus} size="sm">
          Anunciar
        </ButtonLink>
      </div>

      <div className="mt-4 lg:mt-6">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "vitrine", label: "Vitrine" },
            { value: "meus", label: "Meus anúncios" },
          ]}
        />
      </div>

      <div className="mt-5 lg:mt-6">{tab === "vitrine" ? <Vitrine /> : <MeusAnuncios />}</div>
    </div>
  );
}

function Vitrine() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [term, setTerm] = useState("");
  const search = useDebouncedValue(term.trim(), 300);

  const key = JSON.stringify({ typeFilter, search });
  const { items, state, hasMore, loadingMore, moreError, loadMore, reload } = useInfiniteList<TradeListing>(key, (cursor) =>
    listTradeMock({ type: typeFilter === "all" ? undefined : typeFilter, q: search, cursor, limit: PAGE_SIZE }).then((page) => ({
      items: page.items,
      nextCursor: page.nextCursor,
    }))
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            type="search"
            aria-label="Buscar por nome ou código"
            placeholder="Buscar por nome ou código"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className={`${fieldClass} pl-10`}
          />
        </div>
        <SegmentedControl
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "Todos" },
            { value: "TRADE", label: "Troca" },
            { value: "SALE", label: "Venda" },
          ]}
        />
      </div>

      <div className="mt-4">
        {state === "loading" ? (
          <ListingGridSkeleton />
        ) : state === "error" ? (
          <ErrorState onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState kind="no-content" description="Nenhum anúncio ativo no momento. Que tal criar o seu?" action={<ButtonLink href="/anuncio/novo">Anunciar</ButtonLink>} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((listing) => (
                <TradeListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <LoadMore hasMore={hasMore} loading={loadingMore} error={moreError} onLoadMore={loadMore} />
          </>
        )}
      </div>
    </div>
  );
}

function MeusAnuncios() {
  const me = useMe();
  const { items, state, hasMore, loadingMore, moreError, loadMore, reload } = useInfiniteList<TradeListing>("meus-anuncios", (cursor) =>
    listMyTradeMock(me.id, me.name, { cursor, limit: PAGE_SIZE }).then((page) => ({ items: page.items, nextCursor: page.nextCursor }))
  );

  if (state === "loading") return <ListingGridSkeleton />;
  if (state === "error") return <ErrorState onRetry={reload} />;
  if (items.length === 0) return <EmptyState kind="no-content" description="Você ainda não tem anúncios." />;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((listing) => (
          <TradeListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      <LoadMore hasMore={hasMore} loading={loadingMore} error={moreError} onLoadMore={loadMore} />
    </>
  );
}
