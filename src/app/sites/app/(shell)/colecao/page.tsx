import type { Metadata } from "next";
import { ColecaoView } from "./colecao-view";

export const metadata: Metadata = {
  title: "Minha coleção",
  robots: { index: false, follow: false },
};

export default function ColecaoPage() {
  return <ColecaoView />;
}
