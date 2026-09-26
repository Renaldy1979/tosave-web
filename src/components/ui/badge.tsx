import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const badgeVariants = cva("inline-flex items-center gap-1 rounded-xs font-medium", {
  variants: {
    variant: {
      neutral: "bg-surface-3 text-fg-muted",
      primary: "bg-primary-soft text-primary-text",
      accent: "bg-accent-soft text-accent font-mono",
      flame: "bg-flame-soft text-flame",
      glass: "bg-black/50 text-white backdrop-blur",
      success: "bg-success/10 text-success",
      danger: "bg-danger/10 text-danger",
      warning: "bg-accent-soft text-accent",
      outline: "border border-border text-fg-muted",
    },
    size: {
      sm: "h-5 px-1.5 text-[11px]",
      md: "h-6 px-2 text-caption",
    },
  },
  defaultVariants: { variant: "neutral", size: "md" },
});

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & { icon?: LucideIcon; dot?: string };

/** Badge (componentes.md §5). */
export function Badge({ className, variant, size, icon: Icon, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot ? <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: dot }} /> : null}
      {Icon ? <Icon size={size === "sm" ? 12 : 14} strokeWidth={2} aria-hidden /> : null}
      {children}
    </span>
  );
}
