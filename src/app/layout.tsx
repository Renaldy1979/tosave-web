import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Saira, Saira_Condensed } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fontDisplay = Saira({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-saira",
  display: "swap",
});
const fontCondensed = Saira_Condensed({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-saira-condensed",
  display: "swap",
});
const fontMono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: { default: "ToSave", template: "%s · ToSave" },
  description: "Sua garagem em escala 1:64.",
};

export const viewport: Viewport = {
  themeColor: "#0B0B0D",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontCondensed.variable} ${fontMono.variable}`}
    >
      <body className="min-h-dvh">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
