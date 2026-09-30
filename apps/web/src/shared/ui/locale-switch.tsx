"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

const labels: Record<AppLocale, string> = { hy: "Հայ", en: "EN", ru: "РУ" };

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
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
        >
          {labels[item]}
        </Link>
      ))}
    </div>
  );
}
