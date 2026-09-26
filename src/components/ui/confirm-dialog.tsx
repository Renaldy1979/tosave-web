"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  loading?: boolean;
  tone?: "danger" | "primary";
};

/** Confirmação (componentes.md §8); vira sheet ancorado na base no celular. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  children,
  confirmLabel,
  onConfirm,
  loading,
  tone = "danger",
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-60 animate-fade-in bg-overlay/70 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-60 animate-fade-in rounded-t-xl border border-border bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-modal focus:outline-none
            sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[400px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:pb-6"
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-flame-soft text-flame">
            <AlertTriangle size={22} strokeWidth={1.75} aria-hidden />
          </div>
          <Dialog.Title className="mt-4 text-h3 text-fg">{title}</Dialog.Title>
          <Dialog.Description asChild>
            <div className="mt-2 text-body-sm text-fg-muted">{children}</div>
          </Dialog.Description>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button variant="secondary" disabled={loading}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button variant={tone} loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
