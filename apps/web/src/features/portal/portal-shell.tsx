"use client";

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CloseIcon, MenuIcon } from "@/features/portal/admin-sidebar-icons";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { AccountMenu, type AccountHref } from "@/shared/ui/account-menu";
import { LocaleSwitch } from "@/shared/ui/locale-switch";
import { cn } from "@/shared/ui/cn";

export type PortalHref =
  | "/me"
  | "/me/schedule"
  | "/me/visits"
  | "/me/favorites"
  | "/me/questions"
  | "/me/reviews"
  | "/me/notices"
  | "/me/settings"
  | "/super-admin"
  | "/super-admin/clinics"
  | "/super-admin/questions";

export type PortalHash = "visits" | "notices" | "favorites" | "questions" | "reviews" | "settings";

export type PortalNavItem = {
  href: PortalHref;
  hash?: PortalHash;
  label: string;
  icon: ReactNode;
  match?: "exact" | "prefix" | "hash";
  badge?: number;
};

type PortalShellProps = {
  children: ReactNode;
  title: string;
  eyebrow: string;
  subtitle: string;
  accountHref: AccountHref;
  items: PortalNavItem[];
  footerItems: PortalNavItem[];
  navLabel?: string;
  action?: ReactNode;
  portrait?: ReactNode;
  plainLabels?: boolean;
};

function localeNeutralPath(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(`/${locale}`.length) || "/";
  }
  return pathname;
}

function isItemActive(pathname: string, hash: string, item: PortalNavItem): boolean {
  if (item.match === "hash") return pathname === item.href && hash === `#${item.hash ?? ""}`;
  if (item.match === "exact") return pathname === item.href && (hash === "" || hash === "#");
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function usePortalHash(pathname: string): [string, (item: PortalNavItem) => void] {
  const [hash, setHash] = useState("");
  useEffect(() => {
    function syncHash(): void {
      const nextHash = window.location.hash || "";
      setHash(nextHash);
      if (!nextHash) return;
      document.getElementById(nextHash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  const activate = useCallback((item: PortalNavItem) => {
    const nextHash = item.hash ? `#${item.hash}` : "";
    setHash(nextHash);
    if (item.hash) {
      document.getElementById(item.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    document.querySelector(".scrollbar-soft")?.scrollTo({ top: 0, behavior: "smooth" });
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  return [hash, activate];
}

function usePortalChrome(): void {
  useEffect(() => {
    document.body.classList.add("overflow-hidden", "admin-portal-open");
    return () => document.body.classList.remove("overflow-hidden", "admin-portal-open");
  }, []);
}

function navText(plain: boolean): string {
  return plain ? "text-[0.95rem] font-semibold tracking-normal" : "text-[0.82rem] font-semibold tracking-[0.06em] uppercase";
}

function NavLink({
  item,
  active,
  plain,
  onNavigate,
  onActivate,
}: {
  item: PortalNavItem;
  active: boolean;
  plain: boolean;
  onNavigate?: () => void;
  onActivate?: (item: PortalNavItem) => void;
}) {
  return (
    <Link
      href={item.hash ? { pathname: item.href, hash: item.hash } : item.href}
      onClick={() => {
        onActivate?.(item);
        onNavigate?.();
      }}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex w-full items-center gap-3 rounded-l-full py-2.5 pr-5 pl-3.5 transition-[background,color,box-shadow] duration-200",
        navText(plain),
        active
          ? "-mr-3 rounded-r-none bg-white text-[#1e3a38] shadow-[0_8px_22px_rgba(0,0,0,0.12)]"
          : "mr-0 text-white/78 hover:bg-white/10 hover:text-white",
      )}
    >
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-200",
          active ? "bg-[#1e3a38]/10 text-[#1e3a38]" : "bg-white/10 text-white",
        )}
      >
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
      {item.badge && item.badge > 0 ? (
        <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[0.72rem] font-bold text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarNav({
  items,
  footerItems,
  pathname,
  hash,
  subtitle,
  navLabel,
  plainLabels,
  onNavigate,
  onActivate,
}: {
  items: PortalNavItem[];
  footerItems: PortalNavItem[];
  pathname: string;
  hash: string;
  subtitle: string;
  navLabel: string;
  plainLabels: boolean;
  onNavigate?: () => void;
  onActivate?: (item: PortalNavItem) => void;
}) {
  const t = useTranslations("portal");
  return (
    <div className="flex h-full flex-col gap-8">
      <div className="px-1">
        <Link href="/" onClick={() => onNavigate?.()} aria-label="Hippocrates" className="inline-flex flex-col gap-1.5">
          <span className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.02em] text-white">Hippocrates</span>
          <p className={plainLabels ? "m-0 text-sm font-medium text-white/70" : "m-0 text-[0.68rem] font-bold tracking-[0.16em] text-white/55 uppercase"}>{subtitle}</p>
        </Link>
      </div>
      <nav className="grid flex-1 content-start gap-1" aria-label={navLabel}>
        {items.map((item) => (
          <NavLink
            key={`${item.href}-${item.hash ?? "root"}`}
            item={item}
            plain={plainLabels}
            active={isItemActive(pathname, hash, item)}
            onNavigate={onNavigate}
            onActivate={onActivate}
          />
        ))}
      </nav>
      {footerItems.length > 0 ? (
        <nav className="grid gap-1 border-t border-white/12 pt-5" aria-label={t("accountNav")}>
          {footerItems.map((item) => (
            <NavLink
              key={`${item.href}-${item.hash ?? "root"}`}
              item={item}
              plain={plainLabels}
              active={isItemActive(pathname, hash, item)}
              onNavigate={onNavigate}
              onActivate={onActivate}
            />
          ))}
        </nav>
      ) : null}
    </div>
  );
}

function PortalHeader({
  eyebrow,
  title,
  action,
  portrait,
  plainLabels,
  accountHref,
  open,
  menuId,
  onOpen,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  portrait?: ReactNode;
  plainLabels: boolean;
  accountHref: AccountHref;
  open: boolean;
  menuId: string;
  onOpen: () => void;
}) {
  const t = useTranslations("portal");
  const accountLabel = useTranslations("nav")("me");
  const eyebrowClass = plainLabels
    ? "m-0 text-xs font-semibold text-accent"
    : "m-0 text-[0.72rem] font-semibold tracking-[0.12em] text-accent uppercase";
  return (
    <header className="relative z-10 flex flex-wrap items-center gap-x-3 gap-y-3 px-4 pt-4 pb-2 md:px-7 md:pt-6">
      <div className="flex min-w-[min(100%,16rem)] flex-1 items-center gap-3">
        <button
          type="button"
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink md:hidden"
          aria-label={t("openMenu")}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={onOpen}
        >
          <MenuIcon />
        </button>
        {portrait}
        <div className="min-w-0">
          {eyebrow ? <p className={eyebrowClass}>{eyebrow}</p> : null}
          <h1 className="truncate pb-[0.12em] leading-[1.45] text-[clamp(1.55rem,3vw,2.15rem)]">{title}</h1>
        </div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        {action}
        <LocaleSwitch />
        <AccountMenu href={accountHref} label={accountLabel} />
      </div>
    </header>
  );
}

export function PortalShell({ children, title, eyebrow, subtitle, accountHref, items, footerItems, navLabel, action, portrait, plainLabels = false }: PortalShellProps) {
  const t = useTranslations("portal");
  const pathname = localeNeutralPath(usePathname());
  const [hash, activate] = usePortalHash(pathname);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  usePortalChrome();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const sidebar = {
    items,
    footerItems,
    pathname,
    hash,
    subtitle,
    navLabel: navLabel ?? t("navLabel"),
    plainLabels,
    onActivate: activate,
  };

  return (
    <div className="fixed inset-0 z-[60] flex bg-[#eef3f2]">
      <aside className="relative hidden w-[272px] shrink-0 rounded-tr-[2.75rem] rounded-br-[2.75rem] bg-[#2a4a47] px-3 pt-7 pb-6 md:flex md:flex-col">
        <SidebarNav {...sidebar} />
      </aside>
      {open ? (
        <div className="fixed inset-0 z-20 md:hidden">
          <button type="button" className="absolute inset-0 cursor-pointer border-0 bg-[rgba(14,20,20,0.5)] p-0 backdrop-blur-[6px]" aria-label={t("closeMenu")} onClick={close} />
          <aside id={menuId} className="relative z-1 flex h-full w-[min(288px,86vw)] flex-col rounded-tr-[2.5rem] rounded-br-[2.5rem] bg-[#2a4a47] px-3 pt-6 pb-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <button type="button" className="mb-4 ml-auto grid h-10 w-10 cursor-pointer place-items-center rounded-full border-0 bg-white/12 text-white" aria-label={t("closeMenu")} onClick={close}>
              <CloseIcon />
            </button>
            <SidebarNav {...sidebar} onNavigate={close} />
          </aside>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader eyebrow={eyebrow} title={title} action={action} portrait={portrait} plainLabels={plainLabels} accountHref={accountHref} open={open} menuId={menuId} onOpen={() => setOpen(true)} />
        <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-8 md:px-7">{children}</div>
      </div>
    </div>
  );
}
