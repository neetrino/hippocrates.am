import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "@/shared/ui/locale-switch";
import { SiteHeaderShell } from "@/shared/ui/site-header-shell";

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

export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <SiteHeaderShell>
      <div className="bar">
        <Link href="/" className="brand">
          <span className="mark" aria-hidden="true" />
          <span className="brand-name">Hippocrates</span>
        </Link>
        <nav className="nav">
          <Link href="/clinics">{t("clinics")}</Link>
          <Link href="/doctors">{t("doctors")}</Link>
          <Link href="/questions">{t("questions")}</Link>
        </nav>
        <div className="nav-actions">
          <LocaleSwitch />
          <Link href="/register" className="auth-trigger" aria-label={t("register")}>
            <UserIcon />
          </Link>
        </div>
      </div>
    </SiteHeaderShell>
  );
}
