import type { Metadata } from "next";
import { NoticiasView } from "./noticias-view";

export const metadata: Metadata = {
  title: "Notícias",
  robots: { index: false, follow: false },
};

export default function NoticiasPage() {
  return <NoticiasView />;
}
