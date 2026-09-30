import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Hippocrates",
  description: "Ատամնաբուժական կլինիկաների հարթակ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hy">
      <body>
        <header>
          <Link href="/">Hippocrates</Link>
          <nav>
            <Link href="/register">Գրանցում</Link>
            <Link href="/login">Մուտք</Link>
            <Link href="/questions">Հարցեր</Link>
            <Link href="/me">Իմ էջը</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
