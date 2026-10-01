"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cx } from "@/shared/ui/cx";
import primitives from "@/shared/ui/primitives.module.css";
import styles from "@/shared/ui/site-header.module.css";

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
    <header className={cx(styles.header, scrolled && styles.headerScrolled)}>
      <div className={cx(primitives.shell, styles.inner)}>
        <div className={styles.surface} aria-hidden="true" />
        {children}
      </div>
    </header>
  );
}
