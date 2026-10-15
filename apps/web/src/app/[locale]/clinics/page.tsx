import { getTranslations } from "next-intl/server";
import { ClinicsSearch } from "@/features/catalog/clinics-search";
import { PublicClinicsList } from "@/features/catalog/public-clinics-list";
import { loadFavoriteSet } from "@/features/portal/patient-favorites";
import { getPathname } from "@/i18n/navigation";
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
  const needle = name?.trim() ?? "";
  const t = await getTranslations("catalog");
  const common = await getTranslations("common");
  const suggestRequest = publicGet<ClinicCard[]>("/public/clinics", locale);
  const listRequest = needle
    ? publicGet<ClinicCard[]>(`/public/clinics?name=${encodeURIComponent(needle)}`, locale)
    : suggestRequest;
  const [suggestClinics, clinics, favorites] = await Promise.all([
    suggestRequest,
    listRequest,
    loadFavoriteSet(locale),
  ]);

  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))] max-md:pt-[18px]">
      <h1>{t("clinicsTitle")}</h1>
      <ClinicsSearch
        action={getPathname({ locale, href: "/clinics" })}
        suggestClinics={suggestClinics}
        initialName={needle}
        placeholder={t("clinicName")}
        ariaLabel={t("clinicName")}
        searchLabel={common("search")}
        emptySuggest={t("emptyClinicSearch")}
      />
      <PublicClinicsList
        clinics={clinics}
        emptyLabel={t("emptyClinicSearch")}
        savedClinicIds={favorites?.clinicIds ?? null}
      />
    </div>
  );
}
