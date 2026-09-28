import type { Metadata } from "next";
import { EstatisticasView } from "./estatisticas-view";

export const metadata: Metadata = {
  title: "Estatísticas",
  robots: { index: false, follow: false },
};

export default function EstatisticasPage() {
  return <EstatisticasView />;
}
