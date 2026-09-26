"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";

/** `/entrar` e `/cadastro` são só para visitante: já logado, manda para `/boas-vindas`. */
export function useGuestOnly(): boolean {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let alive = true;
    account.get().then(
      () => {
        if (alive) router.replace("/boas-vindas");
      },
      () => {
        if (alive) setChecking(false);
      }
    );
    return () => {
      alive = false;
    };
  }, [router]);
  return checking;
}
