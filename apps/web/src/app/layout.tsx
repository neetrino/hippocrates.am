import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { Noto_Sans, Noto_Sans_Armenian } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const armenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hy",
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${sans.variable} ${armenian.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
