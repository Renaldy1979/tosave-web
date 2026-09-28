import type { Metadata } from "next";
import { AnuncioNovoView } from "./anuncio-novo-view";

export const metadata: Metadata = {
  title: "Anunciar",
  robots: { index: false, follow: false },
};

export default function AnuncioNovoPage() {
  return <AnuncioNovoView />;
}
