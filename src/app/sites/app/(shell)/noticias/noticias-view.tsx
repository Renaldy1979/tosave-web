"use client";

import { LoadMore } from "@/components/app/load-more";
import { NewsCard, NewsGridSkeleton } from "@/components/app/news-card";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { listNewsMock } from "@/app/sites/app/_mock/news";
import { useInfiniteList } from "@/lib/use-infinite-list";

const PAGE_SIZE = 12;

export function NoticiasView() {
  const { items, state, hasMore, loadingMore, moreError, loadMore, reload } = useInfiniteList("noticias", (cursor) =>
    listNewsMock({ cursor, limit: PAGE_SIZE }).then((page) => ({ items: page.items, nextCursor: page.nextCursor }))
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">Notícias</h1>
      <p className="mt-1 text-body-sm text-fg-muted">Novidades e avisos do ToSave.</p>

      <div className="mt-5 lg:mt-6">
        {state === "loading" ? (
          <NewsGridSkeleton />
        ) : state === "error" ? (
          <ErrorState onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState kind="no-content" description="Nenhuma notícia publicada ainda." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {items.map((item) => (
                <NewsCard key={item.id} id={item.id} title={item.title} summary={item.summary} imageFileId={item.imageFileId} publishedAt={item.publishedAt} />
              ))}
            </div>
            <LoadMore hasMore={hasMore} loading={loadingMore} error={moreError} onLoadMore={loadMore} />
          </>
        )}
      </div>
    </div>
  );
}
