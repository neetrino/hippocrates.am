import { getTranslations } from "next-intl/server";

/** Footer copy stays English in every locale. */
export async function SiteFooter() {
  const t = await getTranslations({ locale: "en", namespace: "footer" });
  return (
    <footer data-site-chrome="footer" className="mt-[72px] border-t border-line bg-white py-7 pb-10 text-muted">
      <div className="mx-auto flex w-[min(var(--max-width-shell),calc(100%-48px))] flex-wrap justify-between gap-4 max-md:w-[min(var(--max-width-shell),calc(100%-20px))] max-md:flex-col max-md:gap-2">
        <strong className="text-ink">Hippocrates</strong>
        <p className="m-0 text-muted">{t("tagline")}</p>
      </div>
    </footer>
  );
}
