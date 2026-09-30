import type { ReactNode } from "react";
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
          <a href="/">Hippocrates</a>
          <nav>
            <a href="/register">Գրանցում</a>
            <a href="/login">Մուտք</a>
            <a href="/questions">Հարցեր</a>
            <a href="/me">Իմ էջը</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
