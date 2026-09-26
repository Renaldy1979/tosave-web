import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { APP_URL } from "@/lib/env";

/** Navbar do site institucional: sempre `ink`, como manda o design-system §2. */
export function SiteHeader() {
  return (
    <header className="ink sticky top-0 z-40 border-b border-white/5 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-5 md:px-6 lg:h-16 lg:px-8">
        <Link href="/" aria-label="ToSave" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo size="sm" variant="dark" className="lg:hidden" priority />
          <Logo size="md" variant="dark" className="hidden lg:block" priority />
        </Link>
        <nav aria-label="Site" className="hidden items-center gap-6 md:flex">
          <Link href="/vitrine" className="text-body-sm font-medium text-fg-muted transition duration-fast hover:text-fg">
            Vitrine
          </Link>
          <Link href="/#como-funciona" className="text-body-sm font-medium text-fg-muted transition duration-fast hover:text-fg">
            Como funciona
          </Link>
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <ButtonLink href={`${APP_URL}/entrar`} variant="ghost" size="sm" className="hidden sm:inline-flex">
            Entrar
          </ButtonLink>
          <ButtonLink href={`${APP_URL}/cadastro`} variant="primary" size="sm">
            Criar conta
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
