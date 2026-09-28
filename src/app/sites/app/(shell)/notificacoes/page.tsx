import type { Metadata } from "next";
import { NotificacoesView } from "./notificacoes-view";

export const metadata: Metadata = {
  title: "Notificações",
  robots: { index: false, follow: false },
};

export default function NotificacoesPage() {
  return <NotificacoesView />;
}
