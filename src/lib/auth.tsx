"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { account, appwriteErrorInfo, AppwriteException } from "./appwrite";
import { api, ApiError, clearJwt, setOnUnauthorized } from "./api";

/** `GET /v2/me`. */
export type Me = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "blocked";
  phone: string | null;
};

export type AuthState =
  | { status: "loading" }
  | { status: "signed-out"; reason?: "expired" }
  | { status: "forbidden"; me: Me }
  | { status: "ready"; me: Me }
  | { status: "error"; message: string };

export type SignInError = "invalid_credentials" | "blocked" | "rate_limited" | "network" | "unknown";

type AuthContextValue = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: SignInError }>;
  signOut: () => Promise<void>;
  reload: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadMe(requireAdmin: boolean): Promise<AuthState> {
  try {
    await account.get();
  } catch (err) {
    if (err instanceof AppwriteException) {
      const { status } = appwriteErrorInfo(err);
      if (status === 401 || status === 403) return { status: "signed-out" };
      return { status: "error", message: "Não foi possível verificar sua sessão." };
    }
    return { status: "error", message: "Sem conexão com o servidor de login." };
  }
  try {
    const me = await api<Me>("/v2/me");
    const ready = me.status === "active" && (!requireAdmin || me.role === "admin");
    if (ready) return { status: "ready", me };
    return { status: "forbidden", me };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return { status: "signed-out", reason: "expired" };
    return {
      status: "error",
      message: err instanceof ApiError && err.status === 0 ? "Sem conexão com a API." : "Não foi possível carregar seu perfil.",
    };
  }
}

function mapSignInError(err: unknown): SignInError {
  if (!(err instanceof AppwriteException)) return "network";
  const { status, type } = appwriteErrorInfo(err);
  if (status === 429) return "rate_limited";
  if (type === "user_blocked") return "blocked";
  if (type === "user_invalid_credentials" || type === "general_argument_invalid" || status === 401) {
    return "invalid_credentials";
  }
  return "unknown";
}

export function AuthProvider({ children, requireAdmin = true }: { children: ReactNode; requireAdmin?: boolean }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const reload = useCallback(() => {
    setState({ status: "loading" });
    loadMe(requireAdmin).then(setState);
  }, [requireAdmin]);

  useEffect(() => {
    let alive = true;
    loadMe(requireAdmin).then((s) => {
      if (alive) setState(s);
    });
    setOnUnauthorized(() => setState({ status: "signed-out", reason: "expired" }));
    return () => {
      alive = false;
      setOnUnauthorized(null);
    };
  }, [requireAdmin]);

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password) => {
      clearJwt();
      try {
        await account.createEmailPasswordSession({ email: email.trim().toLowerCase(), password });
      } catch (err) {
        if (appwriteErrorInfo(err).type !== "user_session_already_exists") {
          return { ok: false, error: mapSignInError(err) };
        }
      }
      const next = await loadMe(requireAdmin);
      if (next.status === "error") return { ok: false, error: "network" };
      if (next.status === "signed-out") return { ok: false, error: "unknown" };
      setState(next);
      return { ok: true };
    },
    [requireAdmin]
  );

  const signOut = useCallback(async () => {
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch {
      // a sessão pode já ter morrido no servidor; limpa o estado local mesmo assim.
    }
    clearJwt();
    setState({ status: "signed-out" });
  }, []);

  const value = useMemo(() => ({ state, signIn, signOut, reload }), [state, signIn, signOut, reload]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}

/** Admin logado (só dentro do painel protegido). */
export function useMe(): Me {
  const { state } = useAuth();
  if (state.status !== "ready") throw new Error("useMe sem sessão de admin");
  return state.me;
}
