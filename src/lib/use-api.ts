"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ApiState<T> = {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  reload: () => void;
  setData: (updater: T | ((prev: T | undefined) => T)) => void;
};

type Result<T> = { req: string; data?: T; error?: unknown };

/**
 * Carrega dados no cliente. Refaz quando `key` muda; descarta respostas
 * de chaves antigas (a busca digitada rápido não embaralha a lista).
 */
export function useApi<T>(key: string | null, fetcher: (signal: AbortSignal) => Promise<T>): ApiState<T> {
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const fetcherRef = useRef(fetcher);
  const req = key === null ? null : `${key}#${nonce}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (req === null) return;
    const controller = new AbortController();
    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ req, data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ req, error: error ?? new Error("Falha") });
      });
    return () => controller.abort();
  }, [req]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const setData = useCallback((updater: T | ((prev: T | undefined) => T)) => {
    setResult((prev) => {
      const current = prev?.data;
      const next = typeof updater === "function" ? (updater as (p: T | undefined) => T)(current) : updater;
      return { req: prev?.req ?? "", data: next };
    });
  }, []);

  const fresh = result !== null && result.req === req;
  return {
    data: fresh ? result.data : undefined,
    error: fresh ? (result.error ?? null) : null,
    loading: req !== null && !fresh,
    reload,
    setData,
  };
}
