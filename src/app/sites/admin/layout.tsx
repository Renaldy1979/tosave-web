import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Painel ToSave", template: "%s · Painel ToSave" },
  robots: { index: false, follow: false },
};

export default function AdminSiteLayout({ children }: LayoutProps<"/sites/admin">) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
