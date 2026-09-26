import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "ToSave · Em breve",
  description: "A versão web do ToSave está chegando. Sua garagem em escala 1:64.",
};

/** app.tosave.cloud: página provisória até o app web do colecionador. */
export default function AppComingSoon() {
  return (
    <main className="ink relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div aria-hidden className="absolute inset-0 bg-hero-glow" />
      <div className="relative flex flex-col items-center">
        <Logo size="lg" variant="dark" priority />
        <p className="mt-10 font-condensed text-eyebrow text-fg-subtle uppercase">Em breve</p>
        <h1 className="mt-3 max-w-xl font-display text-display-xl font-extrabold text-fg italic">
          Sua garagem em escala <span className="bg-flame bg-clip-text text-transparent">1:64</span>, agora também na web.
        </h1>
        <p className="mt-5 max-w-md text-body-lg text-fg-muted">
          Estamos preparando a versão web do ToSave. Enquanto isso, sua coleção continua no app.
        </p>
        <span aria-hidden className="mt-10 h-0.5 w-24 rounded-full bg-flame" />
      </div>
    </main>
  );
}
