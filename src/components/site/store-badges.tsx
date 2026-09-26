import { Apple, PlaySquare } from "lucide-react";
import { cn } from "@/lib/cn";

function StoreBadge({ icon: Icon, label }: { icon: typeof Apple; label: string }) {
  return (
    <span className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong px-4 text-body-sm text-fg-muted">
      <Icon size={18} strokeWidth={1.75} aria-hidden />
      <span className="flex flex-col leading-tight">
        <span className="text-caption text-fg-subtle">Em breve na</span>
        <span className="font-medium text-fg">{label}</span>
      </span>
    </span>
  );
}

/** As lojas ainda não têm o app publicado (`docs/briefings/site-lote1.md`). */
export function StoreBadges({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <StoreBadge icon={Apple} label="App Store" />
      <StoreBadge icon={PlaySquare} label="Google Play" />
    </div>
  );
}
