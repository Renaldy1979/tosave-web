import type { Metadata } from "next";
import { CadastroView } from "./cadastro-view";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false, follow: false },
};

export default function CadastroPage() {
  return <CadastroView />;
}
