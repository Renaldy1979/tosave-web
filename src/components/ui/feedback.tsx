import { AlertCircle, Inbox, Car, ServerCrash, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

/** Alerta de formulário (login.md §Estados). */
export function Alert({ children, tone = "danger", className }: { children: ReactNode; tone?: "danger" | "info"; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-body-sm text-fg",
        tone === "danger" ? "border-flame/30 bg-flame-soft" : "border-info/30 bg-info/10",
        className
      )}
    >
      <AlertCircle size={18} strokeWidth={1.75} className={cn("mt-px shrink-0", tone === "danger" ? "text-flame" : "text-info")} aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

const EMPTY_TITLE = {
  "no-cars": "Nenhuma miniatura disponível no momento.",
  "no-content": "Nenhum conteúdo disponível.",
} as const;

/** Estado vazio com os títulos oficiais (componentes.md §9). */
export function EmptyState({
  kind,
  description,
  action,
  icon,
  size = "lg",
}: {
  kind: keyof typeof EMPTY_TITLE;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  size?: "sm" | "lg";
}) {
  const Icon = icon ?? (kind === "no-cars" ? Car : Inbox);
  if (size === "sm") {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Icon size={24} strokeWidth={1.75} className="text-fg-subtle" aria-hidden />
        <p className="text-body-sm text-fg">{EMPTY_TITLE[kind]}</p>
        {description ? <p className="text-caption text-fg-muted">{description}</p> : null}
        {action}
      </div>
    );
  }
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
      <div className="relative mb-5 flex size-22 items-center justify-center rounded-full border border-border bg-surface-2">
        <Icon size={36} strokeWidth={1.75} className="text-fg-subtle" aria-hidden />
        <span
          aria-hidden
          className="absolute -inset-px rounded-full border-2 border-transparent"
          style={{
            background: "linear-gradient(100deg,#FFDE21,#FD8401 45%,#FF0000) border-box",
            mask: "linear-gradient(#000 0 0) padding-box exclude, conic-gradient(#000 0 33%, transparent 33%)",
          }}
        />
      </div>
      <h3 className="text-h3 text-fg">{EMPTY_TITLE[kind]}</h3>
      {description ? <p className="mt-1.5 text-body-sm text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Erro de carregamento (telas/README.md). */
export function ErrorState({ onRetry, message, compact }: { onRetry?: () => void; message?: string; compact?: boolean }) {
  return (
    <div className={cn("mx-auto flex max-w-sm flex-col items-center text-center", compact ? "py-8" : "py-16")}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-flame-soft text-flame">
        <ServerCrash size={26} strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="text-h3 text-fg">Não foi possível carregar.</h3>
      <p className="mt-1.5 text-body-sm text-fg-muted">{message ?? "Verifique sua conexão e tente novamente."}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
