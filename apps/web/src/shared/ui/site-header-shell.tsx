"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

const SCROLL_ACTIVATE_Y = 16;

function isAuthPath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/register";
}

export function SiteHeaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const authPage = isAuthPath(pathname);
  const [scrolled, setScrolled] = useState(authPage);

  useEffect(() => {
    if (authPage) {
      setScrolled(true);
      return;
    }
    function syncScrolled(): void {
      setScrolled(window.scrollY > SCROLL_ACTIVATE_Y);
    }
    syncScrolled();
    window.addEventListener("scroll", syncScrolled, { passive: true });
    return () => window.removeEventListener("scroll", syncScrolled);
  }, [authPage]);

  return (
    <header className={scrolled || authPage ? "site-header is-scrolled" : "site-header"}>
      <div className="shell header-inner">
        <div className="header-surface" aria-hidden="true" />
        {children}
      </div>
    </header>
  );
}
