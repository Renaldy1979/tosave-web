"use client";

import { Button } from "@/components/ui/button";

/** Rodapé de lista paginada: carregando mais, erro (tentar de novo) ou fim da lista. */
export function LoadMore({
  hasMore,
  loading,
  error,
  onLoadMore,
  doneLabel,
}: {
  hasMore: boolean;
  loading: boolean;
  error: boolean;
  onLoadMore: () => void;
  doneLabel?: string;
}) {
  if (loading) {
    return (
      <div className="mt-6 flex justify-center">
        <Button variant="outline" loading disabled>
          Carregando…
        </Button>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-body-sm text-fg-muted">Não foi possível carregar mais.</p>
        <Button variant="outline" onClick={onLoadMore}>
          Tentar novamente
        </Button>
      </div>
    );
  }
  if (hasMore) {
    return (
      <div className="mt-6 flex justify-center">
        <Button variant="outline" onClick={onLoadMore}>
          Carregar mais
        </Button>
      </div>
    );
  }
  if (doneLabel) {
    return <p className="mt-6 text-center text-caption text-fg-subtle">{doneLabel}</p>;
  }
  return null;
}
