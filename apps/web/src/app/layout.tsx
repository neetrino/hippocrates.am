import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { Cormorant_Garamond, Noto_Sans, Noto_Sans_Armenian, Noto_Serif, Noto_Serif_Armenian } from "next/font/google";
import { getSiteUrl } from "@/shared/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
};

const sans = Noto_Sans({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

const armenian = Noto_Sans_Armenian({
  subsets: ["armenian", "latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-hy",
  display: "swap",
});

const serif = Noto_Serif({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

const serifArmenian = Noto_Serif_Armenian({
  subsets: ["armenian", "latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-noto-serif-hy",
  display: "swap",
});

const catalogSerif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: "600",
  style: "italic",
  variable: "--font-cormorant",
  display: "swap",
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${sans.variable} ${armenian.variable} ${serif.variable} ${serifArmenian.variable} ${catalogSerif.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-background">{children}</body>
    </html>
  );
}
