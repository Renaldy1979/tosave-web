import Image from "next/image";
import { cn } from "@/lib/cn";

const WIDTH = { sm: 96, md: 128, lg: 220 } as const;

type LogoProps = {
  /** `auto` alterna por CSS (`.light` usa a variante clara); dentro de `.ink` é sempre a original. */
  variant?: "auto" | "dark" | "light";
  size?: keyof typeof WIDTH | number;
  className?: string;
  priority?: boolean;
};

/** Logo do ToSave (644×241), ver docs/design/marca.md. */
export function Logo({ variant = "auto", size = "md", className, priority }: LogoProps) {
  const width = typeof size === "number" ? size : WIDTH[size];
  const height = Math.round((width * 241) / 644);
  const common = { width, height, priority };
  if (variant === "dark") return <Image src="/brand/logo.png" alt="ToSave" className={className} {...common} />;
  if (variant === "light") return <Image src="/brand/logo-light.png" alt="ToSave" className={className} {...common} />;
  return (
    <span className={cn("inline-block", className)} style={{ width, height }}>
      <Image src="/brand/logo.png" alt="ToSave" className="logo-dark" {...common} />
      <Image src="/brand/logo-light.png" alt="" aria-hidden className="logo-light" {...common} />
    </span>
  );
}
