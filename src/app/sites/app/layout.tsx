import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "ToSave", template: "%s · ToSave" },
  robots: { index: false, follow: false },
};

export default function AppSiteLayout({ children }: LayoutProps<"/sites/app">) {
  return <AuthProvider requireAdmin={false}>{children}</AuthProvider>;
}
