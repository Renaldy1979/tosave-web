import Link from "next/link";
import { cn } from "@/lib/cn";

/** Número grande + label, usado no resumo da Coleção e do Perfil (componentes.md §13). */
export function StatTile({ value, label, href, className }: { value: number; label: string; href?: string; className?: string }) {
  const content = (
    <div className={cn("flex flex-1 flex-col items-center gap-0.5 py-1 text-center", className)}>
      <span className="font-display text-display-lg font-extrabold text-fg italic tabular-nums">{value}</span>
      <span className="text-caption text-fg-muted">{label}</span>
    </div>
  );
  if (!href) return content;
  return (
    <Link href={href} className="flex flex-1 rounded-md transition duration-fast hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  );
}
