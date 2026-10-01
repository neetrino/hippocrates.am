import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "@/shared/ui/locale-switch";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <header className="site-header">
      <div className="shell bar">
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
          <div className="nav-links">
            <Link href="/login">{t("login")}</Link>
            <Link href="/me">{t("me")}</Link>
          </div>
          <Link href="/register" className="btn btn-header">{t("register")}</Link>
        </div>
      </div>
    </header>
  );
}
