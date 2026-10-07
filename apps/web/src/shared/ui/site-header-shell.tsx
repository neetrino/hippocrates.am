"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/shared/ui/cn";

// Compact mode changes the sticky header height. A single threshold lets scroll
// anchoring pull scrollY back across that line and the header oscillates.
const SCROLL_COMPACT_ON_Y = 48;
const SCROLL_COMPACT_OFF_Y = 8;

export function SiteHeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function syncScrolled(): void {
      const y = window.scrollY;
      setScrolled((current) => (current ? y > SCROLL_COMPACT_OFF_Y : y > SCROLL_COMPACT_ON_Y));
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
            "pointer-events-none absolute inset-0 rounded-full border border-accent/14 bg-white/94 opacity-0 shadow-[0_12px_34px_rgba(20,36,40,0.08)] backdrop-blur-[18px] transition-opacity duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] max-md:rounded-[22px]",
            scrolled && "opacity-100",
          )}
          aria-hidden="true"
        />
        {children}
      </div>
    </header>
  );
}
