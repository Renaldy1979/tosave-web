"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type InfiniteListState = "loading" | "ok" | "error";

export type InfinitePage<T, Extra = undefined> = { items: T[]; nextCursor: string | null; extra?: Extra };

/**
 * Lista paginada por cursor com "carregar mais" (rolagem por página, não
 * infinita): a 1ª página recarrega sempre que `key` muda (filtros/busca);
 * páginas seguintes se acumulam em `items` até `nextCursor` virar `null`.
 */
export function useInfiniteList<T, Extra = undefined>(
  key: string,
  fetchPage: (cursor: string | null, signal: AbortSignal) => Promise<InfinitePage<T, Extra>>
) {
  const [items, setItems] = useState<T[]>([]);
  const [extra, setExtra] = useState<Extra | undefined>(undefined);
  const [cursor, setCursor] = useState<string | null>(null);
  const [state, setState] = useState<InfiniteListState>("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const [nonce, setNonce] = useState(0);
  const reqId = useRef(0);
  const fetchRef = useRef(fetchPage);
  useEffect(() => {
    fetchRef.current = fetchPage;
  });

  useEffect(() => {
    const id = ++reqId.current;
    setState("loading");
    setMoreError(false);
    const controller = new AbortController();
    fetchRef
      .current(null, controller.signal)
      .then((page) => {
        if (id !== reqId.current) return;
        setItems(page.items);
        if (page.extra !== undefined) setExtra(page.extra);
        setCursor(page.nextCursor);
        setState("ok");
      })
      .catch(() => {
        if (controller.signal.aborted || id !== reqId.current) return;
        setState("error");
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const loadMore = useCallback(() => {
    if (!cursor || loadingMore || state !== "ok") return;
    const id = reqId.current;
    setLoadingMore(true);
    setMoreError(false);
    fetchRef
      .current(cursor, new AbortController().signal)
      .then((page) => {
        if (id !== reqId.current) return;
        setItems((cur) => [...cur, ...page.items]);
        if (page.extra !== undefined) setExtra(page.extra);
        setCursor(page.nextCursor);
      })
      .catch(() => {
        if (id === reqId.current) setMoreError(true);
      })
      .finally(() => setLoadingMore(false));
  }, [cursor, loadingMore, state]);

  return { items, setItems, extra, state, hasMore: cursor !== null, loadingMore, moreError, loadMore, reload };
}
