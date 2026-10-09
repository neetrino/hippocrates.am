import { getTranslations } from "next-intl/server";
import { PublicClinicsList } from "@/features/catalog/public-clinics-list";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard } from "@/shared/public-types";

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
  const clinics = await publicGet<ClinicCard[]>("/public/clinics", locale);

  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))] max-md:pt-[18px]">
      <h1>{t("clinicsTitle")}</h1>
      <PublicClinicsList
        clinics={clinics}
        initialQuery={name ?? ""}
        placeholder={common("name")}
        ariaLabel={t("clinicName")}
        emptyLabel={t("emptyClinicSearch")}
      />
    </div>
  );
}
