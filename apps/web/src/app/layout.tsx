import type { ReactNode } from "react";
import { Noto_Sans_Armenian } from "next/font/google";
import { SiteFooter } from "@/shared/ui/site-footer";
import { SiteHeader } from "@/shared/ui/site-header";
import "./globals.css";

const sans = Noto_Sans_Armenian({
  subsets: ["armenian", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Hippocrates",
  description: "Ատամնաբուժական կլինիկաների հարթակ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hy" className={sans.variable}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
