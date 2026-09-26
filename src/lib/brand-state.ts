import { Archive, Clock, type LucideIcon } from "lucide-react";
import type { BadgeVariant } from "@/components/ui/badge";
import type { BrandState } from "./admin-types";

export const BRAND_STATE_OPTIONS: { value: BrandState; label: string }[] = [
  { value: "ativa", label: "Ativa" },
  { value: "descontinuada", label: "Descontinuada" },
  { value: "em_analise", label: "Em análise" },
];

/** Badge da situação editorial da marca (design-system §5 `brandState`). */
export const BRAND_STATE_META: Record<BrandState, { label: string; variant: BadgeVariant; icon?: LucideIcon }> = {
  ativa: { label: "Ativa", variant: "success" },
  descontinuada: { label: "Descontinuada", variant: "neutral", icon: Archive },
  em_analise: { label: "Em análise", variant: "warning", icon: Clock },
};
