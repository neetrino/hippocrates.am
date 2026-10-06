"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/shared/ui/cn";

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
    <header
      data-site-chrome="header"
      className={cn(
        "group sticky top-0 z-20 bg-transparent py-3.5 transition-[padding] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] max-md:py-2",
        scrolled && "is-scrolled py-2.5 max-md:py-1.5",
      )}
    >
      <div className="relative mx-auto w-[min(var(--max-width-shell),calc(100%-48px))] max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full border border-line bg-surface/92 opacity-0 shadow-soft backdrop-blur-xl transition-opacity duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] max-md:rounded-[1.25rem]",
            scrolled && "opacity-100",
          )}
          aria-hidden="true"
        />
        {children}
      </div>
    </header>
  );
}
