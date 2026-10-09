import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";
import { type AccountHref } from "@/shared/ui/account-menu";
import { BrandLogo } from "@/shared/ui/brand-logo";
import { SiteHeaderShell } from "@/shared/ui/site-header-shell";
import { SiteNav } from "@/shared/ui/site-nav";

function accountHref(role: string | null): AccountHref {
  if (role === "SUPER_ADMIN") return "/super-admin";
  if (role === "ADMIN") return "/clinic";
  if (role) return "/me";
  return "/login";
}

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const me = await sessionGet<Me>("/auth/me");
  const href = accountHref(me?.role ?? null);
  return (
    <SiteHeaderShell>
      <div className="relative z-1 grid min-h-22 grid-cols-[1fr_auto_1fr] items-center gap-6 px-[18px] transition-[min-height] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-[.is-scrolled]:min-h-18 max-md:min-h-16 max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-2.5 max-md:px-2.5 max-md:py-2 max-md:group-[.is-scrolled]:min-h-[58px]">
        <Link href="/" className="inline-flex shrink-0 items-center justify-self-start" aria-label="Hippocrates">
          <BrandLogo priority />
        </Link>
        <SiteNav
          clinics={t("clinics")}
          doctors={t("doctors")}
          questions={t("questions")}
          accountHref={href}
          accountLabel={href === "/login" ? t("login") : t("me")}
          openMenu={t("openMenu")}
          closeMenu={t("closeMenu")}
        />
      </div>
    </SiteHeaderShell>
  );
}
