"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { errorMessage } from "./api";
import { addToCollection, getCollectionSummary, removeFromCollection, setCollectionQuantity } from "./collection";
import type { Summary } from "./app-types";

const ZERO_SUMMARY: Summary = { totalItems: 0, totalModels: 0, duplicates: 0 };

type CollectionSummaryContextValue = {
  summary: Summary;
  loading: boolean;
  reload: () => void;
  setSummary: (next: Summary) => void;
};

const CollectionSummaryContext = createContext<CollectionSummaryContextValue | null>(null);

/** Resumo da coleção (Itens/Modelos/Repetidos), compartilhado entre Início, Coleção e Perfil. */
export function CollectionSummaryProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<Summary>(ZERO_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getCollectionSummary()
      .then((s) => {
        if (alive) setSummary(s);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const value = useMemo(() => ({ summary, loading, reload, setSummary }), [summary, loading, reload]);
  return <CollectionSummaryContext.Provider value={value}>{children}</CollectionSummaryContext.Provider>;
}

export function useCollectionSummary(): CollectionSummaryContextValue {
  const ctx = useContext(CollectionSummaryContext);
  if (!ctx) throw new Error("useCollectionSummary precisa do CollectionSummaryProvider");
  return ctx;
}

/** Adicionar/remover/definir quantidade, com o resumo global atualizado a cada mutação. */
export function useCollectionMutations() {
  const { setSummary } = useCollectionSummary();

  const toggle = useCallback(
    async (carId: string, currentQuantity: number, onDone: (quantity: number) => void) => {
      try {
        const result = currentQuantity > 0 ? await removeFromCollection(carId) : await addToCollection(carId);
        onDone(result.item?.quantity ?? 0);
        setSummary(result.summary);
      } catch (err) {
        toast.error(errorMessage(err));
      }
    },
    [setSummary]
  );

  const setQuantity = useCallback(
    async (carId: string, next: number, onDone: (quantity: number) => void) => {
      try {
        const result = await setCollectionQuantity(carId, next);
        onDone(result.item?.quantity ?? 0);
        setSummary(result.summary);
      } catch (err) {
        toast.error(errorMessage(err));
      }
    },
    [setSummary]
  );

  return { toggle, setQuantity };
}
