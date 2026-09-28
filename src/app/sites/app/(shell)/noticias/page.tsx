import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = {
  title: "Notícias",
  robots: { index: false, follow: false },
};

export default function NoticiasPage() {
  return <ComingSoon icon={Newspaper} title="Notícias" description="Em breve você acompanha as novidades do ToSave por aqui." />;
}
