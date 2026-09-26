"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StoreBadges } from "@/components/site/store-badges";
import { Logo } from "@/components/ui/logo";
import { account } from "@/lib/appwrite";

type State = { status: "loading" | "redirecting" } | { status: "ready"; name: string };

export function BoasVindasView() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    account.get().then(
      (me) => {
        if (alive) setState({ status: "ready", name: me.name });
      },
      () => {
        if (alive) {
          setState({ status: "redirecting" });
          router.replace("/entrar");
        }
      }
    );
    return () => {
      alive = false;
    };
  }, [router]);

  const signOut = async () => {
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch {
      // a sessão pode já ter morrido no servidor; segue para /entrar mesmo assim.
    }
    router.push("/entrar");
  };

  if (state.status !== "ready") return null;

  const firstName = state.name.trim().split(/\s+/)[0] || "";

  return (
    <main className="ink relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 text-center">
      <span aria-hidden className="absolute inset-0 bg-hero-glow" />
      <div className="relative flex flex-col items-center">
        <Logo size="lg" variant="dark" priority />
        <p className="mt-10 font-condensed text-eyebrow text-fg-subtle uppercase">Conta criada</p>
        <h1 className="mt-3 max-w-xl font-display text-display-xl font-extrabold text-fg italic">
          {firstName ? `Bem-vindo(a), ${firstName}!` : "Bem-vindo(a)!"}
        </h1>
        <p className="mt-5 max-w-md text-body-lg text-fg-muted">
          A versão web do ToSave ainda está a caminho. Por enquanto, monte sua garagem pelo app.
        </p>
        <StoreBadges className="mt-8 justify-center" />
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-10 inline-flex items-center gap-1.5 text-body-sm text-fg-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut size={16} strokeWidth={1.75} aria-hidden />
          Sair
        </button>
      </div>
    </main>
  );
}
