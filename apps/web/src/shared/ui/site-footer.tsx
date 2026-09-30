import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  return (
    <footer className="site-footer">
      <div className="shell footer-row">
        <strong>Hippocrates</strong>
        <p className="muted">{t("tagline")}</p>
      </div>
    </footer>
  );
}
