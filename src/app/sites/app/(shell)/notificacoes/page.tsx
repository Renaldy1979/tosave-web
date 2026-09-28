import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = {
  title: "Notificações",
  robots: { index: false, follow: false },
};

export default function NotificacoesPage() {
  return <ComingSoon icon={Bell} title="Notificações" description="Em breve sua caixa de notificações aparece aqui." />;
}
