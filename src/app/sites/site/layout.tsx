import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

const TITLE = "ToSave · Sua garagem em escala 1:64";
const DESCRIPTION =
  "Monte, organize e compartilhe sua coleção de Hot Wheels e Matchbox. Cadastre-se de graça e leve sua garagem para onde você for.";

export const metadata: Metadata = {
  metadataBase: new URL("https://tosave.cloud"),
  // `absolute`: o template "%s · ToSave" do layout raiz não se aplica ao título do site.
  title: { absolute: TITLE, template: "%s · ToSave" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "ToSave",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [{ url: "/brand/logo-car.png", width: 644, height: 185, alt: "ToSave" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/brand/logo-car.png"],
  },
};

export default function SiteLayout({ children }: LayoutProps<"/sites/site">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
