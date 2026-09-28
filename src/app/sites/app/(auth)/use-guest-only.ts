"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

/** `/entrar`, `/cadastro` e `/recuperar-senha` são só para visitante: já logado, manda para `/`. */
export function useGuestOnly(): boolean {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status === "ready" || state.status === "forbidden") router.replace("/");
  }, [state.status, router]);

  return state.status === "loading" || state.status === "ready" || state.status === "forbidden";
}
