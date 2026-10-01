import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard, DoctorCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

type HomeData = { clinics: ClinicCard[]; doctors: DoctorCard[] };

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");
  const common = await getTranslations("common");
  const data = await publicGet<HomeData>("/public/home");
  const action = getPathname({ locale, href: "/clinics" });
  return (
    <div className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1>{t("title")}</h1>
          <p className="lede">{t("lede")}</p>
          <form className="search" action={action}>
            <input name="name" placeholder={t("clinicPlaceholder")} aria-label={t("clinicPlaceholder")} />
            <button className="btn" type="submit">{common("search")}</button>
          </form>
        </div>
        <div className="stats">
          <p>{t.rich("clinicStat", { count: data.clinics.length, strong: (chunks) => <strong>{chunks}</strong> })}</p>
          <p>{t.rich("doctorStat", { count: data.doctors.length, strong: (chunks) => <strong>{chunks}</strong> })}</p>
          <p><Link href="/doctors">{t("allDoctors")}</Link></p>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <h2>{nav("clinics")}</h2>
          <Link href="/clinics">{common("seeAll")}</Link>
        </div>
        {data.clinics.length === 0 ? <EmptyState>{t("emptyClinics")}</EmptyState> : null}
        <div className="grid-cards">
          {data.clinics.map((clinic, index) => (
            <ClinicTile key={clinic.id} clinic={clinic} loading={index === 0 ? "eager" : undefined} />
          ))}
        </div>
      </section>
    </div>
  );
}
