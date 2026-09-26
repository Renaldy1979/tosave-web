"use client";

import { ShieldX } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";

function ShellSkeleton() {
  return (
    <div aria-busy="true" className="min-h-dvh lg:pl-62">
      <div className="fixed inset-y-0 left-0 hidden w-62 border-r border-border bg-surface p-5 lg:block">
        <Skeleton className="h-8 w-32" />
        <div className="mt-10 space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </div>
      <div className="ink h-14 lg:hidden" />
      <div className="mx-auto max-w-[1280px] space-y-4 px-4 py-6 md:px-8 md:py-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>
    </div>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Logo size="md" />
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 text-center shadow-card md:p-8">{children}</div>
    </div>
  );
}

/** Área protegida: só admin ativo (`GET /v2/me` → `role: "admin"`). */
export default function PainelLayout({ children }: LayoutProps<"/sites/admin">) {
  const { state, signOut, reload } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (state.status !== "signed-out") return;
    const params = new URLSearchParams();
    if (pathname && pathname !== "/") params.set("next", pathname);
    if (state.reason === "expired") params.set("expired", "1");
    const qs = params.toString();
    router.replace(`/login${qs ? `?${qs}` : ""}`);
  }, [state, pathname, router]);

  if (state.status === "loading" || state.status === "signed-out") return <ShellSkeleton />;

  if (state.status === "error") {
    return (
      <CenteredCard>
        <ErrorState compact message={state.message} onRetry={reload} />
      </CenteredCard>
    );
  }

  if (state.status === "forbidden") {
    return (
      <CenteredCard>
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-flame-soft text-flame">
          <ShieldX size={26} strokeWidth={1.75} aria-hidden />
        </div>
        <h1 className="text-h2 text-fg">Acesso negado</h1>
        <p className="mt-2 text-body text-fg-muted">
          A conta <strong className="text-fg">{state.me.email}</strong>{" "}
          {state.me.status === "blocked" ? "está bloqueada." : "não tem permissão de administrador."}
        </p>
        <Button variant="secondary" className="mt-6" fullWidth onClick={() => void signOut()}>
          Entrar com outra conta
        </Button>
      </CenteredCard>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
