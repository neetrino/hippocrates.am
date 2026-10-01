import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { DoctorCard } from "@/shared/public-types";
import { DoctorTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";
import { cx } from "@/shared/ui/cx";
import ui from "@/shared/ui/primitives.module.css";

export default async function DoctorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ name?: string; specialty?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const queryParams = await searchParams;
  const t = await getTranslations("catalog");
  const common = await getTranslations("common");
  const query = new URLSearchParams();
  if (queryParams.name) query.set("name", queryParams.name);
  if (queryParams.specialty) query.set("specialty", queryParams.specialty);
  const suffix = query.size > 0 ? `?${query}` : "";
  const doctors = await publicGet<DoctorCard[]>(`/public/doctors${suffix}`);
  return (
    <div className={cx(ui.shell, ui.section)}>
      <h1>{t("doctorsTitle")}</h1>
      <form className={ui.search} action={getPathname({ locale, href: "/doctors" })}>
        <input name="name" defaultValue={queryParams.name ?? ""} placeholder={common("name")} aria-label={t("doctorName")} />
        <input name="specialty" defaultValue={queryParams.specialty ?? ""} placeholder={t("specialty")} aria-label={t("specialty")} />
        <button className={ui.btn} type="submit">{common("search")}</button>
      </form>
      {doctors.length === 0 ? <EmptyState>{t("emptyDoctorSearch")}</EmptyState> : null}
      <div className={ui.gridCards}>
        {doctors.map((doctor) => <DoctorTile key={doctor.id} doctor={doctor} />)}
      </div>
    </div>
  );
}
