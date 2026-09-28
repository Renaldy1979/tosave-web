import type { Metadata } from "next";
import { Repeat } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = {
  title: "Clube da Troca",
  robots: { index: false, follow: false },
};

export default function TrocaPage() {
  return <ComingSoon icon={Repeat} title="Clube da Troca" description="Em breve você anuncia trocas e vendas da sua coleção aqui." />;
}
