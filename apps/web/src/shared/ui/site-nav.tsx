"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, Link } from "@/i18n/navigation";
import { LocaleSwitch } from "@/shared/ui/locale-switch";

type SiteNavProps = {
  clinics: string;
  doctors: string;
  questions: string;
  register: string;
  openMenu: string;
  closeMenu: string;
};

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 19.2c1.4-3.1 3.7-4.6 6.5-4.6s5.1 1.5 6.5 4.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SiteNav({
  clinics,
  doctors,
  questions,
  register,
  openMenu,
  closeMenu,
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
        <LocaleSwitch />
        <Link href="/register" className="auth-trigger" aria-label={register}>
          <UserIcon />
        </Link>
        <button
          type="button"
          className="menu-trigger"
          aria-label={open ? closeMenu : openMenu}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className={open ? "menu-icon is-open" : "menu-icon"} aria-hidden="true">
            <span />
            <span />
            <span />
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
