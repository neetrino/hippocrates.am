import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";
import ui from "@/shared/ui/primitives.module.css";
import home from "./home.module.css";

type HomeData = { clinics: ClinicCard[] };

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");
  const common = await getTranslations("common");
  const data = await publicGet<HomeData>("/public/home");
  const action = getPathname({ locale, href: "/clinics" });
  return (
    <div className={ui.shell}>
      <section className={home.hero}>
        <div className={home.copy}>
          <h1>{t("title")}</h1>
          <p className={ui.lede}>{t("lede")}</p>
          <form className={ui.search} action={action}>
            <input name="name" placeholder={t("clinicPlaceholder")} aria-label={t("clinicPlaceholder")} />
            <button className={ui.btn} type="submit">{common("search")}</button>
          </form>
        </div>
      </section>
      <section className={ui.section}>
        <div className={ui.sectionHead}>
          <h2>{nav("clinics")}</h2>
          <Link href="/clinics">{common("seeAll")}</Link>
        </div>
        {data.clinics.length === 0 ? <EmptyState>{t("emptyClinics")}</EmptyState> : null}
        <div className={ui.gridCards}>
          {data.clinics.map((clinic, index) => (
            <ClinicTile key={clinic.id} clinic={clinic} loading={index === 0 ? "eager" : undefined} />
          ))}
        </div>
      </section>
    </div>
  );
}
