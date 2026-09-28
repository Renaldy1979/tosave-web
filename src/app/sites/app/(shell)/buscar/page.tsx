import type { Metadata } from "next";
import { BuscarView } from "./buscar-view";

export const metadata: Metadata = {
  title: "Buscar",
  robots: { index: false, follow: false },
};

export default function BuscarPage() {
  return <BuscarView />;
}
