"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { MOCK_COLLECTION } from "./data";

export type CollectionSummary = { totalItems: number; totalModels: number; duplicates: number };

type CollectionState = {
  quantities: Record<string, number>;
  quantityOf: (carId: string) => number;
  toggle: (carId: string) => void;
  setQuantity: (carId: string, next: number) => void;
  summary: CollectionSummary;
};

const CollectionContext = createContext<CollectionState | null>(null);

function summarize(quantities: Record<string, number>): CollectionSummary {
  const entries = Object.values(quantities).filter((q) => q > 0);
  return {
    totalItems: entries.reduce((sum, q) => sum + q, 0),
    totalModels: entries.length,
    duplicates: entries.filter((q) => q > 1).length,
  };
}

/**
 * Estado local da coleção de exemplo (fase A, sem backend): fica só na
 * memória da aba, reseta ao recarregar. A fase B troca por `useCollectionStore`
 * ligado à API v2 (`GET/POST/PUT /v2/collection`).
 */
export function CollectionStoreProvider({ children }: { children: ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>(MOCK_COLLECTION);

  const setQuantity = useCallback((carId: string, next: number) => {
    setQuantities((prev) => {
      const clamped = Math.max(0, Math.min(99, next));
      if (clamped === 0) {
        return Object.fromEntries(Object.entries(prev).filter(([id]) => id !== carId));
      }
      return { ...prev, [carId]: clamped };
    });
  }, []);

  const toggle = useCallback(
    (carId: string) => {
      setQuantities((prev) => {
        const current = prev[carId] ?? 0;
        if (current > 0) {
          return Object.fromEntries(Object.entries(prev).filter(([id]) => id !== carId));
        }
        return { ...prev, [carId]: 1 };
      });
    },
    []
  );

  const quantityOf = useCallback((carId: string) => quantities[carId] ?? 0, [quantities]);
  const summary = useMemo(() => summarize(quantities), [quantities]);

  const value = useMemo(
    () => ({ quantities, quantityOf, toggle, setQuantity, summary }),
    [quantities, quantityOf, toggle, setQuantity, summary]
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollectionStore(): CollectionState {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error("useCollectionStore precisa do CollectionStoreProvider");
  return ctx;
}
