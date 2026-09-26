import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Logo size="md" />
      <h1 className="mt-10 text-h2 text-fg">Página não encontrada.</h1>
      <p className="mt-2 text-body text-fg-muted">O endereço pode ter mudado ou não existe mais.</p>
      <Link href="/" className={buttonVariants({ variant: "secondary", className: "mt-6" })}>
        Voltar ao início
      </Link>
    </main>
  );
}
