import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = {
  title: "Estatísticas",
  robots: { index: false, follow: false },
};

export default function EstatisticasPage() {
  return <ComingSoon icon={BarChart3} title="Estatísticas" description="Em breve você vê as estatísticas da sua coleção aqui." />;
}
