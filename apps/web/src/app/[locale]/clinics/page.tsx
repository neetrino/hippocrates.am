import { getTranslations } from "next-intl/server";
import { ClinicsSearch } from "@/features/catalog/clinics-search";
import { PublicClinicsList } from "@/features/catalog/public-clinics-list";
import { loadFavoriteSet } from "@/features/portal/patient-favorites";
import { getPathname } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard } from "@/shared/public-types";
import { ListPagination, listPage } from "@/shared/ui/list-pagination";

export default async function ClinicsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ name?: string; page?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const { name, page: rawPage } = await searchParams;
  const page = listPage(rawPage);
  const needle = name?.trim() ?? "";
  const t = await getTranslations("catalog");
  const common = await getTranslations("common");
  const suggestRequest = publicGet<ClinicCard[]>("/public/clinics", locale);
  const listQuery = new URLSearchParams();
  if (needle) listQuery.set("name", needle);
  if (page > 1) listQuery.set("page", String(page));
  const listRequest = listQuery.size > 0
    ? publicGet<ClinicCard[]>(`/public/clinics?${listQuery}`, locale)
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
      <ListPagination page={page} itemCount={clinics.length} query={{ name: needle || undefined }} />
    </div>
  );
}
