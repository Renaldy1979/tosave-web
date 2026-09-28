"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getUnreadNotificationsCount } from "./notifications";

type NotificationsUnreadContextValue = {
  count: number;
  reload: () => void;
  decrement: (by?: number) => void;
  clear: () => void;
};

const NotificationsUnreadContext = createContext<NotificationsUnreadContextValue | null>(null);

/** Contador de notificações não lidas (sino da AppShell), compartilhado com a caixa de Notificações. */
export function NotificationsUnreadProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    getUnreadNotificationsCount()
      .then(({ count }) => {
        if (alive) setCount(count);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const decrement = useCallback((by = 1) => setCount((c) => Math.max(0, c - by)), []);
  const clear = useCallback(() => setCount(0), []);

  const value = useMemo(() => ({ count, reload, decrement, clear }), [count, reload, decrement, clear]);
  return <NotificationsUnreadContext.Provider value={value}>{children}</NotificationsUnreadContext.Provider>;
}

export function useNotificationsUnread(): NotificationsUnreadContextValue {
  const ctx = useContext(NotificationsUnreadContext);
  if (!ctx) throw new Error("useNotificationsUnread precisa do NotificationsUnreadProvider");
  return ctx;
}
