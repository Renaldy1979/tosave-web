import type { Metadata } from "next";
import { Suspense } from "react";
import { RecuperarSenhaView } from "./recuperar-senha-view";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
  robots: { index: false, follow: false },
};

export default function RecuperarSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RecuperarSenhaView />
    </Suspense>
  );
}
