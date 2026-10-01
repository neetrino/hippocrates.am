"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/shared/ui/cn";
import { LocaleFlag } from "@/shared/ui/locale-flag";

const labels: Record<AppLocale, string> = { hy: "HY", en: "EN", ru: "RU" };

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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
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
    <div className={cn("relative", hideOnMobile && "max-md:hidden")} ref={rootRef}>
      <button
        type="button"
        className="grid h-[42px] w-[42px] cursor-pointer place-items-center rounded-full border border-line bg-white p-0 text-ink transition-[color,border-color,box-shadow] duration-160 hover:border-accent hover:text-accent hover:shadow-[0_6px_16px_rgba(0,167,157,0.14)] aria-expanded:border-accent aria-expanded:text-accent aria-expanded:shadow-[0_6px_16px_rgba(0,167,157,0.14)]"
        aria-label={t("language")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <GlobeIcon />
      </button>
      {open ? (
        <div
          className="absolute top-[calc(100%+10px)] right-0 z-30 grid min-w-[140px] gap-0.5 rounded-[14px] border border-line bg-white p-2 shadow-soft"
          id={menuId}
          role="menu"
        >
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
              className="inline-flex min-h-10 w-full items-center gap-2.5 rounded-[10px] px-3.5 py-2 font-sans text-[0.88rem] font-semibold tracking-[0.08em] text-ink uppercase hover:bg-accent-soft hover:text-accent aria-[current=true]:bg-accent-soft aria-[current=true]:text-accent"
            >
              <LocaleFlag locale={item} />
              <span className="leading-none">{labels[item]}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
