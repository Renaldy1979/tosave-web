import type { Metadata } from "next";
import { BoasVindasView } from "./boas-vindas-view";

export const metadata: Metadata = {
  title: "Boas-vindas",
  robots: { index: false, follow: false },
};

export default function BoasVindasPage() {
  return <BoasVindasView />;
}
