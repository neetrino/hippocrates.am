"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { LocaleSwitch } from "@/shared/ui/locale-switch";

type SiteNavProps = {
  clinics: string;
  doctors: string;
  questions: string;
  register: string;
  openMenu: string;
  closeMenu: string;
};

const localeCodes: Record<AppLocale, string> = { hy: "HY", en: "EN", ru: "RU" };

function LocaleFlag({ locale }: { locale: AppLocale }) {
  if (locale === "hy") {
    return (
      <svg className="locale-flag" viewBox="0 0 18 12" aria-hidden="true">
        <rect width="18" height="4" y="0" fill="#D90012" />
        <rect width="18" height="4" y="4" fill="#0033A0" />
        <rect width="18" height="4" y="8" fill="#F2A800" />
      </svg>
    );
  }
  if (locale === "ru") {
    return (
      <svg className="locale-flag" viewBox="0 0 18 12" aria-hidden="true">
        <rect width="18" height="4" y="0" fill="#FFFFFF" stroke="#D0D5D4" strokeWidth="0.3" />
        <rect width="18" height="4" y="4" fill="#0039A6" />
        <rect width="18" height="4" y="8" fill="#D52B1E" />
      </svg>
    );
  }
  return (
    <svg className="locale-flag" viewBox="0 0 18 12" aria-hidden="true">
      <rect width="18" height="12" fill="#012169" />
      <path d="M0 0L18 12M18 0L0 12" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M0 0L18 12M18 0L0 12" stroke="#C8102E" strokeWidth="1" />
      <path d="M9 0V12M0 6H18" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M9 0V12M0 6H18" stroke="#C8102E" strokeWidth="1.6" />
    </svg>
  );
}

function localeNeutralPath(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(`/${locale}`.length) || "/";
    }
  }
  return pathname;
}

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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
  const pathname = localeNeutralPath(usePathname());
  const locale = useLocale();
  const t = useTranslations("nav");
  const menuId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, locale]);

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

  const links = [
    { href: "/clinics" as const, label: clinics },
    { href: "/doctors" as const, label: doctors },
    { href: "/questions" as const, label: questions },
  ];

  return (
    <div className="header-chrome">
      <nav className="nav">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
      </nav>
      <div className="nav-actions">
        <LocaleSwitch />
        <Link href="/register" className="auth-trigger" aria-label={register}>
          <UserIcon />
        </Link>
        <button
          type="button"
          className="menu-trigger"
          aria-label={openMenu}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen(true)}
        >
          <span className="menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
      {mounted && open
        ? createPortal(
            <div className="mobile-menu" id={menuId} role="dialog" aria-modal="true" aria-label={openMenu}>
              <button
                type="button"
                className="mobile-menu-backdrop"
                aria-label={closeMenu}
                onClick={() => setOpen(false)}
              />
              <div className="mobile-menu-shell">
                <div className="mobile-menu-top">
                  <Image
                    src="/brand/hippocrates-logo.png"
                    alt="Hippocrates"
                    width={160}
                    height={98}
                    className="mobile-menu-logo"
                  />
                  <button
                    type="button"
                    className="mobile-menu-close"
                    aria-label={closeMenu}
                    onClick={() => setOpen(false)}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div className="mobile-menu-card">
                  <nav className="mobile-menu-nav">
                    {links.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mobile-menu-locales">
                    <p className="mobile-menu-locales-label">{t("language")}</p>
                    <div className="mobile-locale-pill" role="group" aria-label={t("language")}>
                      {routing.locales.map((item) => (
                        <Link
                          key={item}
                          href={pathname}
                          locale={item}
                          hrefLang={item}
                          className={item === locale ? "is-active" : undefined}
                          aria-current={item === locale ? "true" : undefined}
                          replace
                          onClick={() => setOpen(false)}
                        >
                          <LocaleFlag locale={item} />
                          <span>{localeCodes[item]}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
