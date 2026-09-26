import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

/** Login do painel (telas/login.md): split no desktop, faixa ink no celular. */
export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="ink relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-16">
        <div aria-hidden className="absolute inset-0 bg-hero-glow" />
        <div className="relative">
          <Logo size="lg" variant="dark" priority />
          <p className="mt-10 max-w-md font-display text-display-xl font-extrabold text-fg italic">
            Sua garagem em escala 1:64.
          </p>
          <p className="mt-4 max-w-md text-body-lg text-fg-muted">
            Painel de administração do catálogo: miniaturas, séries, marcas, usuários e configurações do app.
          </p>
        </div>
      </aside>

      <div className="ink relative flex h-40 shrink-0 items-center justify-center overflow-hidden lg:hidden">
        <div aria-hidden className="absolute inset-0 bg-hero-glow" />
        <Logo size={160} variant="dark" priority className="relative" />
      </div>

      <main className="relative -mt-6 flex flex-1 items-start justify-center rounded-t-xl bg-bg px-4 pt-8 pb-10 lg:mt-0 lg:items-center lg:rounded-none lg:px-8">
        <div className="w-full max-w-[400px]">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
