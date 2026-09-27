import { Logo } from "@/components/ui/logo";
import { APP_URL } from "@/lib/env";
import { StoreBadges } from "./store-badges";

const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-5 md:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Logo variant="auto" size="sm" />
            <p className="mt-4 text-body-sm text-fg-muted">
              Sua garagem em escala 1:64, numa comunidade de colecionadores de Hot Wheels e Matchbox que só cresce.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-condensed text-eyebrow text-fg-subtle uppercase">Leve a coleção com você</p>
            <StoreBadges />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-caption text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ToSave. Todos os direitos reservados.</p>
          <a href={`${APP_URL}/entrar`} className="hover:text-fg-muted">
            Já sou colecionador
          </a>
        </div>
      </div>
    </footer>
  );
}
