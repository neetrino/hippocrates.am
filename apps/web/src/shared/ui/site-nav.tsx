"use client";

import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { LocaleFlag } from "@/shared/ui/locale-flag";
import { LocaleSwitch } from "@/shared/ui/locale-switch";
import { cn } from "@/shared/ui/cn";

type SiteNavProps = {
  clinics: string;
  doctors: string;
  questions: string;
  login: string;
  openMenu: string;
  closeMenu: string;
};

type NavLink = {
  href: "/clinics" | "/doctors" | "/questions";
  label: string;
};

type IndicatorBox = {
  left: number;
  width: number;
  ready: boolean;
};

const localeCodes: Record<AppLocale, string> = { hy: "HY", en: "EN", ru: "RU" };

function subscribeNoop(): () => void {
  return () => undefined;
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopPrimaryNav({ links, pathname }: { links: NavLink[]; pathname: string }) {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [indicator, setIndicator] = useState<IndicatorBox>({ left: 0, width: 0, ready: false });
  const activeIndex = links.findIndex((item) => isActivePath(pathname, item.href));
  const labelsKey = links.map((item) => item.label).join("|");

  useLayoutEffect(() => {
    function measure(): void {
      const nav = navRef.current;
      const active = itemRefs.current[activeIndex];
      if (!nav || !active || activeIndex < 0) {
        setIndicator((prev) => ({ ...prev, ready: false }));
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const itemRect = active.getBoundingClientRect();
      setIndicator({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
        ready: true,
      });
    }

    measure();
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    for (const item of itemRefs.current) {
      if (item) observer.observe(item);
    }
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [activeIndex, labelsKey, pathname]);

  return (
    <nav
      ref={navRef}
      className="relative justify-self-center gap-1.5 rounded-full border border-line bg-[#f5fafa] p-1.5 max-md:hidden md:flex md:items-center"
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-[0_4px_14px_rgba(0,167,157,0.12)] transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          indicator.ready ? "opacity-100" : "opacity-0",
        )}
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
        }}
      />
      {links.map((item, index) => {
        const active = index === activeIndex;
        return (
          <Link
            key={item.href}
            href={item.href}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative z-1 grid h-11 place-items-center rounded-full px-[18px] text-[0.98rem] font-medium tracking-[0.01em] transition-[color,font-weight] duration-300",
              active ? "font-semibold text-accent" : "text-muted hover:text-accent",
            )}
          >
            <span className="relative leading-none">
              {item.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-[calc(100%+3px)] right-0 left-0 h-0.5 rounded-full",
                  active ? "bg-accent" : "bg-transparent",
                )}
              />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteNav({
  clinics,
  doctors,
  questions,
  login,
  openMenu,
  closeMenu,
}: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const pathname = localeNeutralPath(usePathname());
  const locale = useLocale();
  const routeKey = `${locale}:${pathname}`;
  const [menuRoute, setMenuRoute] = useState(routeKey);
  const t = useTranslations("nav");
  const menuId = useId();

  if (menuRoute !== routeKey) {
    setMenuRoute(routeKey);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  const links: NavLink[] = [
    { href: "/clinics", label: clinics },
    { href: "/doctors", label: doctors },
    { href: "/questions", label: questions },
  ];

  return (
    <div className="contents">
      <DesktopPrimaryNav links={links} pathname={pathname} />
      <div className="flex items-center justify-self-end gap-2.5 max-md:gap-2">
        <LocaleSwitch hideOnMobile />
        <Link
          href="/login"
          className="grid h-[42px] w-[42px] place-items-center rounded-full bg-accent text-white shadow-accent transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-[0_12px_24px_rgba(0,167,157,0.28)] max-md:h-[38px] max-md:w-[38px]"
          aria-label={login}
        >
          <UserIcon />
        </Link>
        <button
          type="button"
          className="hidden h-[42px] w-[42px] cursor-pointer place-items-center rounded-full border border-line bg-white p-0 text-ink max-md:grid max-md:h-[38px] max-md:w-[38px]"
          aria-label={openMenu}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen(true)}
        >
          <span className="relative block h-3.5 w-[18px]" aria-hidden="true">
            <span className="absolute top-0 left-0 block h-0.5 w-full rounded-full bg-current" />
            <span className="absolute top-1.5 left-0 block h-0.5 w-full rounded-full bg-current" />
            <span className="absolute top-3 left-0 block h-0.5 w-full rounded-full bg-current" />
          </span>
        </button>
      </div>
      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 px-4 pt-[max(16px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))] md:hidden"
              id={menuId}
              role="dialog"
              aria-modal="true"
              aria-label={openMenu}
            >
              <button
                type="button"
                className="absolute inset-0 cursor-pointer border-0 bg-[rgba(14,20,20,0.62)] p-0 backdrop-blur-[10px]"
                aria-label={closeMenu}
                onClick={() => setOpen(false)}
              />
              <div className="relative z-1 mx-auto grid w-[min(100%,420px)] gap-[18px] [animation:mobile-menu-in_280ms_cubic-bezier(0.22,1,0.36,1)]">
                <div className="flex items-center justify-between gap-3 px-0.5 py-1">
                  <Image
                    src="/brand/hippocrates-logo.png"
                    alt="Hippocrates"
                    width={160}
                    height={98}
                    className="h-12 w-auto object-contain"
                  />
                  <button
                    type="button"
                    className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border-0 bg-white/16 text-white"
                    aria-label={closeMenu}
                    onClick={() => setOpen(false)}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div className="grid gap-[22px] rounded-[28px] bg-white px-[22px] pt-7 pb-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
                  <nav className="grid gap-1">
                    {links.map((item) => {
                      const active = isActivePath(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "rounded-xl px-1.5 py-3.5 text-[1.35rem] font-semibold tracking-[-0.02em] transition-colors duration-160",
                            active
                              ? "bg-accent-soft text-accent underline decoration-accent decoration-2 underline-offset-[6px]"
                              : "text-ink active:bg-accent-soft active:text-accent",
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="grid gap-2.5 border-t border-line pt-[18px]">
                    <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">{t("language")}</p>
                    <div className="grid grid-cols-3 gap-1 rounded-full bg-[#eef2f2] p-1" role="group" aria-label={t("language")}>
                      {routing.locales.map((item) => (
                        <Link
                          key={item}
                          href={pathname}
                          locale={item}
                          hrefLang={item}
                          className={cn(
                            "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full text-[0.88rem] font-bold text-muted",
                            item === locale && "bg-white text-ink shadow-[0_4px_14px_rgba(20,36,40,0.08)]",
                          )}
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
