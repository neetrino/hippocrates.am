"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

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

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = localeNeutralPath(usePathname());
  const t = useTranslations("nav");
  return (
    <div className="locales" aria-label={t("language")}>
      {routing.locales.map((item) => (
        <Link
          key={item}
          href={pathname}
          locale={item}
          hrefLang={item}
          aria-current={item === locale ? "true" : undefined}
          replace
        >
          {labels[item]}
        </Link>
      ))}
    </div>
  );
}
