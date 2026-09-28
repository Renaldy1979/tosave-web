import type { Metadata } from "next";
import { TrocaView } from "./troca-view";

export const metadata: Metadata = {
  title: "Clube da Troca",
  robots: { index: false, follow: false },
};

export default function TrocaPage() {
  return <TrocaView />;
}
