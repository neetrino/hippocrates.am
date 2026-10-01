import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";
import { cx } from "@/shared/ui/cx";
import ui from "@/shared/ui/primitives.module.css";

export default async function ClinicsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const { name } = await searchParams;
  const t = await getTranslations("catalog");
  const common = await getTranslations("common");
  const query = name ? `?name=${encodeURIComponent(name)}` : "";
  const clinics = await publicGet<ClinicCard[]>(`/public/clinics${query}`);
  return (
    <div className={cx(ui.shell, ui.section)}>
      <h1>{t("clinicsTitle")}</h1>
      <form className={ui.search} action={getPathname({ locale, href: "/clinics" })}>
        <input name="name" defaultValue={name ?? ""} placeholder={common("name")} aria-label={t("clinicName")} />
        <button className={ui.btn} type="submit">{common("search")}</button>
      </form>
      {clinics.length === 0 ? <EmptyState>{t("emptyClinicSearch")}</EmptyState> : null}
      <div className={ui.gridCards}>
        {clinics.map((clinic, index) => (
          <ClinicTile key={clinic.id} clinic={clinic} loading={index === 0 ? "eager" : undefined} />
        ))}
      </div>
    </div>
  );
}
