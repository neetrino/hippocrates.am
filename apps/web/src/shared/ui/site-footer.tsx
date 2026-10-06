import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/shared/ui/brand-logo";
import { PageFrame } from "@/shared/ui/page-frame";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  return (
    <footer data-site-chrome="footer" className="mt-16 border-t border-line bg-surface py-12 text-muted max-md:mt-10 max-md:py-9">
      <PageFrame className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr] md:items-start">
        <div className="grid gap-3">
          <Link href="/" className="inline-flex w-fit" aria-label="Hippocrates">
            <BrandLogo size="menu" />
          </Link>
          <p className="m-0 max-w-[28rem] text-[0.94rem] leading-relaxed">{t("tagline")}</p>
        </div>
        <nav className="grid gap-2.5 content-start" aria-label={t("explore")}>
          <p className="kicker">{t("explore")}</p>
          <Link href="/clinics" className="w-fit text-ink transition-colors duration-160 hover:text-accent">
            {nav("clinics")}
          </Link>
          <Link href="/doctors" className="w-fit text-ink transition-colors duration-160 hover:text-accent">
            {nav("doctors")}
          </Link>
          <Link href="/questions" className="w-fit text-ink transition-colors duration-160 hover:text-accent">
            {nav("questions")}
          </Link>
        </nav>
        <div className="grid gap-2.5 content-start">
          <p className="kicker">{t("account")}</p>
          <Link href="/login" className="w-fit text-ink transition-colors duration-160 hover:text-accent">
            {nav("login")}
          </Link>
          <Link href="/register" className="w-fit text-ink transition-colors duration-160 hover:text-accent">
            {nav("register")}
          </Link>
        </div>
      </PageFrame>
    </footer>
  );
}
