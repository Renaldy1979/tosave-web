"use client";

import { AlertCircle } from "lucide-react";
import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/input";
import { cn } from "@/lib/cn";

/** Card de seção numerada do formulário admin (admin-carros.md, Regras visuais). */
export function FormSection({
  n,
  title,
  description,
  invalid,
  children,
}: {
  n: number;
  title: string;
  description?: string;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg bg-surface p-5 shadow-card md:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary-soft font-mono text-body-sm text-primary-text">
          {n}
        </span>
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-h3 text-fg">
            {title}
            {invalid ? <span aria-label="Seção com erros" className="size-2 rounded-full bg-danger" /> : null}
          </h2>
          {description ? <p className="text-body-sm text-fg-subtle">{description}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

/** Label com "*" de obrigatório. */
export function RequiredLabel({ children }: { children: ReactNode }) {
  return (
    <>
      {children} <span className="text-flame">*</span>
    </>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldClass, "h-auto min-h-[120px] resize-y py-3", className)}
      {...props}
    />
  );
});

/** Erro de servidor no topo do formulário (dados preservados). */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-md border border-flame/30 bg-flame-soft px-4 py-3 text-body-sm text-fg">
      <AlertCircle size={18} strokeWidth={1.75} className="mt-px shrink-0 text-flame" aria-hidden />
      {message}
    </div>
  );
}

/** Barra de ações sticky na base (telas/README.md, padrão de formulário). */
export function ActionBar({
  dirty,
  saving,
  disabled,
  saveLabel,
  onCancel,
  left,
}: {
  dirty: boolean;
  saving: boolean;
  disabled?: boolean;
  saveLabel: string;
  onCancel: () => void;
  left?: ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-6 border-t border-border bg-surface/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:-mx-8 md:px-8">
      <div className="flex flex-wrap items-center gap-3">
        {left}
        <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:flex-none">
          {dirty ? (
            <span className="hidden items-center gap-2 text-body-sm text-fg-muted sm:flex">
              Alterações não salvas <span aria-hidden className="size-2 rounded-full bg-warning" />
            </span>
          ) : null}
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 sm:flex-none" loading={saving} disabled={disabled}>
            {saving ? "Salvando…" : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
