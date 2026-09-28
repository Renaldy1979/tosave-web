import type { Metadata } from "next";
import { MaisView } from "./mais-view";

export const metadata: Metadata = {
  title: "Mais",
  robots: { index: false, follow: false },
};

export default function MaisPage() {
  return <MaisView />;
}
