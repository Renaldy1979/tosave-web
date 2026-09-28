import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Linha de lista com ícone (perfil, tela Mais): link interno, externo ou botão. */
export function ListRow({
  icon: Icon,
  label,
  value,
  onClick,
  href,
  external,
  danger,
  active,
  showChevron = true,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  danger?: boolean;
  active?: boolean;
  showChevron?: boolean;
}) {
  const content = (
    <>
      <Icon size={18} strokeWidth={1.75} className={danger ? "text-danger" : active ? "text-primary" : "text-fg-subtle"} aria-hidden />
      <span className={`flex-1 text-body-sm font-medium ${danger ? "text-danger" : active ? "text-primary-text" : "text-fg"}`}>{label}</span>
      {value ? <span className="truncate text-body-sm text-fg-subtle">{value}</span> : null}
      {showChevron && (onClick || href) ? <ChevronRight size={16} strokeWidth={1.75} className="text-fg-subtle" aria-hidden /> : null}
    </>
  );
  const cls = cn(
    "flex min-h-13 items-center gap-3 border-b border-border px-4 last:border-b-0 text-left transition duration-fast hover:bg-surface-3/50",
    active && "bg-primary-soft"
  );
  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`w-full ${cls}`}>
        {content}
      </button>
    );
  }
  return <div className={cls}>{content}</div>;
}
