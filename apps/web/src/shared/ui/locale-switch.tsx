"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cx } from "@/shared/ui/cx";
import styles from "@/shared/ui/locale-switch.module.css";

const labels: Record<AppLocale, string> = { hy: "Հայ", en: "EN", ru: "РУ" };

/** Drop a leading locale segment if present so switches never stack prefixes. */
function localeNeutralPath(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(`/${locale}`.length) || "/";
    }
  }
  return pathname;
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <ellipse cx="12" cy="12" rx="3.8" ry="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.2 9.2h17.6M3.2 14.8h17.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

type LocaleSwitchProps = {
  hideOnMobile?: boolean;
};

export function LocaleSwitch({ hideOnMobile = false }: LocaleSwitchProps) {
  const locale = useLocale();
  const pathname = localeNeutralPath(usePathname());
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={cx(styles.root, hideOnMobile && styles.hideOnMobile)} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={t("language")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <GlobeIcon />
      </button>
      {open ? (
        <div className={styles.menu} id={menuId} role="menu">
          {routing.locales.map((item) => (
            <Link
              key={item}
              href={pathname}
              locale={item}
              hrefLang={item}
              role="menuitem"
              aria-current={item === locale ? "true" : undefined}
              replace
              onClick={() => setOpen(false)}
            >
              {labels[item]}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
