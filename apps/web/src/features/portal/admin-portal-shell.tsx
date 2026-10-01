"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  CloseIcon,
  ClinicsIcon,
  DashboardIcon,
  DoctorsIcon,
  MenuIcon,
  NoticesIcon,
  QuestionsIcon,
  RegisterClinicIcon,
  VisitsIcon,
} from "@/features/portal/admin-sidebar-icons";
import { LogoutButton } from "@/features/portal/logout-button";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LocaleSwitch } from "@/shared/ui/locale-switch";
import { cn } from "@/shared/ui/cn";

type PortalHref = "/me" | "/me/clinics" | "/me/doctors" | "/me/questions" | "/me/register";

type NavItem = {
  href: PortalHref;
  hash?: "visits" | "notices";
  label: string;
  icon: ReactNode;
  match?: "exact" | "prefix" | "hash";
};

function localeNeutralPath(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(`/${locale}`.length) || "/";
    }
  }
  return pathname;
}

function isItemActive(pathname: string, hash: string, item: NavItem): boolean {
  if (item.match === "hash") {
    return pathname === "/me" && hash === `#${item.hash ?? ""}`;
  }
  if (item.match === "exact") {
    return pathname === item.href && (hash === "" || hash === "#");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.hash ? { pathname: item.href, hash: item.hash } : item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-l-full py-2.5 pr-5 pl-3.5 text-[0.82rem] font-semibold tracking-[0.06em] uppercase transition-[background,color,box-shadow] duration-200",
        active
          ? "-mr-3 rounded-r-none bg-white text-tiffany-ink shadow-[0_8px_22px_rgba(20,57,54,0.12)]"
          : "mr-0 text-tiffany-ink/72 hover:bg-white/35 hover:text-tiffany-ink",
      )}
    >
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-200",
          active ? "bg-tiffany/55 text-tiffany-ink" : "bg-white/30 text-tiffany-ink",
        )}
      >
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SidebarNav({
  items,
  footerItems,
  pathname,
  hash,
  onNavigate,
}: {
  items: NavItem[];
  footerItems: NavItem[];
  pathname: string;
  hash: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("portal");
  return (
    <div className="flex h-full flex-col gap-8">
      <div className="px-1">
        <Link href="/me" onClick={onNavigate} className="inline-flex flex-col gap-1.5">
          <span className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.02em] text-tiffany-ink">
            hippocrates
          </span>
          <p className="m-0 text-[0.68rem] font-bold tracking-[0.16em] text-tiffany-ink/55 uppercase">
            {t("subtitle")}
          </p>
        </Link>
      </div>
      <nav className="grid flex-1 content-start gap-1" aria-label={t("navLabel")}>
        {items.map((item) => (
          <NavLink
            key={`${item.href}-${item.hash ?? "root"}`}
            item={item}
            active={isItemActive(pathname, hash, item)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <nav className="grid gap-1 border-t border-tiffany-ink/12 pt-5" aria-label={t("accountNav")}>
        {footerItems.map((item) => (
          <NavLink
            key={`${item.href}-${item.hash ?? "root"}`}
            item={item}
            active={isItemActive(pathname, hash, item)}
            onNavigate={onNavigate}
          />
        ))}
        <LogoutButton className="mt-1 flex w-full cursor-pointer items-center justify-start gap-3 rounded-l-full border-0 bg-transparent py-2.5 pr-4 pl-3.5 text-left text-[0.82rem] font-semibold tracking-[0.06em] text-tiffany-ink/72 uppercase transition-colors duration-200 hover:bg-white/35 hover:text-tiffany-ink" />
      </nav>
    </div>
  );
}

type AdminPortalShellProps = {
  children: ReactNode;
  title: string;
  eyebrow: string;
  action?: ReactNode;
};

export function AdminPortalShell({ children, title, eyebrow, action }: AdminPortalShellProps) {
  const t = useTranslations("portal");
  const nav = useTranslations("nav");
  const me = useTranslations("me");
  const pathname = localeNeutralPath(usePathname());
  const [hash, setHash] = useState("");
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    function syncHash(): void {
      const nextHash = window.location.hash || "";
      setHash(nextHash);
      if (!nextHash) return;
      const id = nextHash.slice(1);
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.add("overflow-hidden", "admin-portal-open");
    return () => document.body.classList.remove("overflow-hidden", "admin-portal-open");
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const items: NavItem[] = [
    { href: "/me", label: t("dashboard"), icon: <DashboardIcon />, match: "exact" },
    { href: "/me/clinics", label: nav("clinics"), icon: <ClinicsIcon />, match: "prefix" },
    { href: "/me/doctors", label: nav("doctors"), icon: <DoctorsIcon />, match: "prefix" },
    { href: "/me/questions", label: nav("questions"), icon: <QuestionsIcon />, match: "prefix" },
    { href: "/me/register", label: me("openPlatform"), icon: <RegisterClinicIcon />, match: "prefix" },
  ];
  const footerItems: NavItem[] = [
    { href: "/me", hash: "visits", label: me("visits"), icon: <VisitsIcon />, match: "hash" },
    { href: "/me", hash: "notices", label: me("notices"), icon: <NoticesIcon />, match: "hash" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex bg-[#eef3f2]">
      <aside className="relative hidden w-[272px] shrink-0 rounded-tr-[2.75rem] rounded-br-[2.75rem] bg-tiffany px-3 pt-7 pb-6 md:flex md:flex-col">
        <SidebarNav items={items} footerItems={footerItems} pathname={pathname} hash={hash} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-20 md:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer border-0 bg-[rgba(14,20,20,0.5)] p-0 backdrop-blur-[6px]"
            aria-label={t("closeMenu")}
            onClick={() => setOpen(false)}
          />
          <aside
            id={menuId}
            className="relative z-1 flex h-full w-[min(288px,86vw)] flex-col rounded-tr-[2.5rem] rounded-br-[2.5rem] bg-tiffany px-3 pt-6 pb-5 shadow-[0_24px_60px_rgba(20,57,54,0.22)]"
          >
            <button
              type="button"
              className="mb-4 ml-auto grid h-10 w-10 cursor-pointer place-items-center rounded-full border-0 bg-white/45 text-tiffany-ink"
              aria-label={t("closeMenu")}
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>
            <SidebarNav
              items={items}
              footerItems={footerItems}
              pathname={pathname}
              hash={hash}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-2 md:px-7 md:pt-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink md:hidden"
              aria-label={t("openMenu")}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </button>
            <div className="min-w-0">
              <p className="m-0 text-[0.72rem] font-semibold tracking-[0.12em] text-accent uppercase">
                {eyebrow}
              </p>
              <h1 className="truncate text-[clamp(1.55rem,3vw,2.15rem)]">{title}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            {action}
            <LocaleSwitch />
          </div>
        </header>
        <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-8 md:px-7">
          {children}
        </div>
      </div>
    </div>
  );
}
