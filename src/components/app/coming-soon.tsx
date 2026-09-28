import type { LucideIcon } from "lucide-react";

/** Placeholder "Em breve" das telas do lote 5b, só para validar a navegação. */
export function ComingSoon({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-20 text-center sm:px-5 md:px-6 lg:px-8 lg:py-28">
      <div className="mb-5 flex size-22 items-center justify-center rounded-full border border-border bg-surface-2">
        <Icon size={36} strokeWidth={1.75} className="text-fg-subtle" aria-hidden />
      </div>
      <h1 className="text-h1 text-fg">{title}</h1>
      <p className="mt-1.5 text-body-sm text-fg-muted">{description}</p>
      <span className="mt-4 inline-flex h-7 items-center rounded-xs bg-accent-soft px-2.5 text-caption font-medium text-accent">Em breve</span>
    </div>
  );
}
