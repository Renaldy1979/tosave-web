import type { Metadata } from "next";
import { HomeView } from "./home-view";

export const metadata: Metadata = {
  title: "Início",
  robots: { index: false, follow: false },
};

export default function AppHomePage() {
  return <HomeView />;
}
