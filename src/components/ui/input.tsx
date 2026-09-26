"use client";

import { AlertCircle, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export const fieldClass =
  "h-11 w-full rounded-md border border-border-strong bg-surface-2 px-3.5 text-body text-fg placeholder:text-fg-subtle " +
  "transition duration-fast hover:border-fg-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 " +
  "disabled:cursor-not-allowed disabled:bg-surface-3 disabled:opacity-50 " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15";

type FieldProps = {
  label: ReactNode;
  hint?: string;
  error?: string;
  id?: string;
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
  className?: string;
};

/** Label + campo + hint/erro (componentes.md §3). */
export function Field({ label, hint, error, id, children, className }: FieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  const msgId = `${fieldId}-msg`;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={fieldId} className="block text-body-sm font-medium text-fg">
        {label}
      </label>
      {children({ id: fieldId, describedBy: error || hint ? msgId : undefined })}
      {error ? (
        <p id={msgId} className="text-caption text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="text-caption text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  hint?: string;
  error?: string;
  leftIcon?: LucideIcon;
  mono?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon: Left, mono, className, id, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} id={id} className={className}>
      {({ id: fieldId, describedBy }) => (
        <div className="relative">
          {Left ? (
            <Left size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle" />
          ) : null}
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(fieldClass, Left && "pl-10", error && "pr-10", mono && "font-mono")}
            {...props}
          />
          {error ? (
            <AlertCircle size={18} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-danger" aria-hidden />
          ) : null}
        </div>
      )}
    </Field>
  );
});

type PasswordInputProps = Omit<InputProps, "type" | "leftIcon">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { label, hint, error, className, id, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} hint={hint} error={error} id={id} className={className}>
      {({ id: fieldId, describedBy }) => (
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={visible ? "text" : "password"}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(fieldClass, "pr-12")}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-fg-subtle hover:bg-surface-3 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {visible ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
          </button>
        </div>
      )}
    </Field>
  );
});
