"use client";

import { useState } from "react";
import type { Page } from "./admin-types";
import { useApi, type ApiState } from "./use-api";

export type CursorPage<T> = ApiState<Page<T>> & {
  pageIndex: number;
  hasNext: boolean;
  total: number | null;
  next: () => void;
  prev: () => void;
};

/**
 * Paginação por cursor (a API só anda para frente): guarda o cursor de
 * cada página visitada. O chamador deve remontar (`key`) ao mudar filtros.
 */
export function useCursorPage<T>(
  baseKey: string,
  fetchPage: (cursor: string | null, signal: AbortSignal) => Promise<Page<T>>
): CursorPage<T> {
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [stickyTotal, setStickyTotal] = useState<number | null>(null);
  const cursor = cursors[pageIndex];

  const state = useApi<Page<T>>(`${baseKey}:${pageIndex}:${cursor ?? ""}`, (signal) => fetchPage(cursor, signal));

  return {
    ...state,
    pageIndex,
    hasNext: !!state.data?.nextCursor,
    total: state.data?.total ?? stickyTotal,
    next: () => {
      if (state.data?.total !== null && state.data?.total !== undefined) setStickyTotal(state.data.total);
      setCursors((stack) => [...stack.slice(0, pageIndex + 1), state.data?.nextCursor ?? null]);
      setPageIndex((i) => i + 1);
    },
    prev: () => setPageIndex((i) => Math.max(0, i - 1)),
  };
}
