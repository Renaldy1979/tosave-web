import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { SITE_URL } from "@/lib/env";

/** Layout de Auth (docs/design/telas/login.md): aside ink no desktop, faixa ink no mobile. */
export default function AuthLayout({ children }: LayoutProps<"/sites/app">) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="ink relative hidden shrink-0 flex-col justify-center overflow-hidden px-16 lg:flex lg:w-1/2">
        <span aria-hidden className="absolute inset-0 bg-hero-glow" />
        <div className="relative">
          <Logo size="lg" variant="dark" priority />
          <p className="mt-8 max-w-sm font-display text-display-xl font-extrabold text-fg italic">Sua garagem em escala 1:64.</p>
        </div>
      </aside>

      <div className="ink relative flex h-40 shrink-0 items-center justify-center overflow-hidden lg:hidden">
        <span aria-hidden className="absolute inset-0 bg-hero-glow" />
        <Logo size="md" variant="dark" priority className="relative" />
      </div>

      <div className="relative -mt-6 flex flex-1 flex-col items-center justify-center rounded-t-xl bg-bg px-4 py-10 lg:mt-0 lg:rounded-none lg:px-10">
        <a
          href={SITE_URL}
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-body-sm text-fg-muted hover:text-fg lg:top-8 lg:left-8"
        >
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
          Voltar ao site
        </a>
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
