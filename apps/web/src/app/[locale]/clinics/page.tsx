import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageStack } from "@/shared/ui/page-frame";
import { SearchBar } from "@/shared/ui/search-bar";

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
  const clinics = await publicGet<ClinicCard[]>(`/public/clinics${query}`, locale);
  return (
    <PageStack>
      <div className="grid max-w-[40rem] gap-3">
        <p className="kicker">{t("clinicSearchCount", { count: clinics.length })}</p>
        <h1>{t("clinicsTitle")}</h1>
      </div>
      <SearchBar
        action={getPathname({ locale, href: "/clinics" })}
        defaultValue={name ?? ""}
        placeholder={t("clinicSearchPlaceholder")}
        ariaLabel={t("clinicSearchAria")}
        submitLabel={common("search")}
      />
      {clinics.length === 0 ? <EmptyState>{t("emptyClinicSearch")}</EmptyState> : null}
      <div className="grid gap-4 max-md:gap-3 md:grid-cols-3">
        {clinics.map((clinic, index) => (
          <ClinicTile key={clinic.id} clinic={clinic} loading={index === 0 ? "eager" : undefined} />
        ))}
      </div>
    </PageStack>
  );
}
