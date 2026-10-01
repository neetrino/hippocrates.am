"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname, Link } from "@/i18n/navigation";

type SiteNavProps = {
  clinics: string;
  doctors: string;
  questions: string;
  openMenu: string;
  closeMenu: string;
  actions: ReactNode;
};

export function SiteNav({
  clinics,
  doctors,
  questions,
  openMenu,
  closeMenu,
  actions,
}: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const menuId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("nav-lock");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("nav-lock");
    };
  }, [open]);

  return (
    <div className="header-chrome">
      <nav className={open ? "nav is-open" : "nav"} id={menuId}>
        <Link href="/clinics" onClick={() => setOpen(false)}>{clinics}</Link>
        <Link href="/doctors" onClick={() => setOpen(false)}>{doctors}</Link>
        <Link href="/questions" onClick={() => setOpen(false)}>{questions}</Link>
      </nav>
      <div className="nav-actions">
        {actions}
        <button
          type="button"
          className="menu-trigger"
          aria-label={open ? closeMenu : openMenu}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className={open ? "menu-icon is-open" : "menu-icon"} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>
      {mounted && open
        ? createPortal(
            <button
              type="button"
              className="nav-backdrop"
              aria-label={closeMenu}
              onClick={() => setOpen(false)}
            />,
            document.body,
          )
        : null}
    </div>
  );
}
