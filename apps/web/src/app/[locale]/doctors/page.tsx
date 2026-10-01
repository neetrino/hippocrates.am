import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { DoctorsSearch } from "@/features/catalog/doctors-search";
import { publicGet } from "@/shared/public-api";
import type { DoctorCard } from "@/shared/public-types";
import { DoctorTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

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
  const query = new URLSearchParams();
  if (queryParams.name) query.set("name", queryParams.name);
  if (queryParams.specialty) query.set("specialty", queryParams.specialty);
  const suffix = query.size > 0 ? `?${query}` : "";
  const doctors = await publicGet<DoctorCard[]>(`/public/doctors${suffix}`);
  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))] max-md:pt-[18px]">
      <h1>{t("doctorsTitle")}</h1>
      <DoctorsSearch
        action={getPathname({ locale, href: "/doctors" })}
        initialName={queryParams.name ?? ""}
        initialSpecialty={queryParams.specialty ?? ""}
        labels={{
          namePlaceholder: t("doctorSearchPlaceholder"),
          nameAria: t("doctorName"),
          specialty: t("specialty"),
          openFilters: t("openFilters"),
          resetFilters: t("resetFilters"),
          applyFilters: t("applyFilters"),
        }}
      />
      {doctors.length === 0 ? <EmptyState>{t("emptyDoctorSearch")}</EmptyState> : null}
      <div className="grid gap-5 max-md:gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => <DoctorTile key={doctor.id} doctor={doctor} />)}
      </div>
    </div>
  );
}
