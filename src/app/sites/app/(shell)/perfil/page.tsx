import type { Metadata } from "next";
import { PerfilView } from "./perfil-view";

export const metadata: Metadata = {
  title: "Perfil",
  robots: { index: false, follow: false },
};

export default function PerfilPage() {
  return <PerfilView />;
}
