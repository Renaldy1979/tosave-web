"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

/** Toasts (componentes.md §13): canto inferior direito no desktop, topo no celular. */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="bottom-right"
      mobileOffset={{ top: 64 }}
      visibleToasts={3}
      duration={4000}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!rounded-lg !border !border-border !border-l-4 !bg-surface !text-fg !shadow-pop !font-sans !text-body-sm",
          success: "!border-l-success",
          error: "!border-l-danger",
          info: "!border-l-info",
          description: "!text-fg-muted",
          actionButton: "!bg-primary !text-primary-fg",
        },
      }}
    />
  );
}
