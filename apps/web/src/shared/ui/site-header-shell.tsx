"use client";

import { useEffect, useState, type ReactNode } from "react";

const SCROLL_ACTIVATE_Y = 16;

export function SiteHeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function syncScrolled(): void {
      setScrolled(window.scrollY > SCROLL_ACTIVATE_Y);
    }
    syncScrolled();
    window.addEventListener("scroll", syncScrolled, { passive: true });
    return () => window.removeEventListener("scroll", syncScrolled);
  }, []);

  return (
    <header className={scrolled ? "site-header is-scrolled" : "site-header"}>
      <div className="shell header-inner">
        <div className="header-surface" aria-hidden="true" />
        {children}
      </div>
    </header>
  );
}
