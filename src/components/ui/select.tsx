import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type NativeSelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

/** Select nativo estilizado (componentes.md §4): abre o picker do sistema no celular. */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { className, invalid, children, ...props },
  ref
) {
  return (
    <div className={cn("relative", className)}>
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full appearance-none truncate rounded-md border border-border-strong bg-surface-2 pr-10 pl-3.5 text-body text-fg",
          "transition duration-fast hover:border-fg-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger"
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={18}
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle"
        aria-hidden
      />
    </div>
  );
});
