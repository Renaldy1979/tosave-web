import type { Metadata } from "next";
import { EntrarView } from "./entrar-view";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function EntrarPage() {
  return <EntrarView />;
}
