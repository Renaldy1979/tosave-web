import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition duration-fast ease-out-expo " +
    "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
    "disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:bg-primary-hover",
        secondary: "bg-surface-3 text-fg hover:bg-border-strong",
        outline: "border border-border-strong text-fg hover:border-primary hover:text-primary-text",
        ghost: "text-fg-muted hover:bg-surface-3 hover:text-fg",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-9 px-3 text-body-sm",
        md: "h-11 px-4 text-body",
        lg: "h-13 px-6 text-body-lg font-semibold",
        icon: "size-10",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

const ICON_SIZE = { sm: 16, md: 18, lg: 20, icon: 20 } as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    loading?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, fullWidth, leftIcon: Left, rightIcon: Right, loading, disabled, children, type = "button", ...props },
  ref
) {
  const iconSize = ICON_SIZE[size ?? "md"];
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 size={iconSize} strokeWidth={1.75} className="animate-spin" aria-hidden />
      ) : Left ? (
        <Left size={iconSize} strokeWidth={1.75} aria-hidden />
      ) : null}
      {children}
      {Right && !loading ? <Right size={iconSize} strokeWidth={1.75} aria-hidden /> : null}
    </button>
  );
});

type ButtonLinkProps = VariantProps<typeof buttonVariants> & {
  href: string;
  className?: string;
  leftIcon?: LucideIcon;
  children: ReactNode;
  external?: boolean;
};

export function ButtonLink({ href, className, variant, size, fullWidth, leftIcon: Left, children, external }: ButtonLinkProps) {
  const cls = cn(buttonVariants({ variant, size, fullWidth }), className);
  const icon = Left ? <Left size={ICON_SIZE[size ?? "md"]} strokeWidth={1.75} aria-hidden /> : null;
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {icon}
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {icon}
      {children}
    </Link>
  );
}
