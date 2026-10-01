import { getTranslations } from "next-intl/server";
import { DoctorsSearch } from "@/features/catalog/doctors-search";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { getPathname } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { DoctorCard } from "@/shared/public-types";
import { DoctorTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

type DoctorFiltersResponse = {
  specialties: string[];
  cities: string[];
  clinics: { id: string; name: string }[];
};

function toList(value?: string | string[]): string[] {
  if (!value) return [];
  const parts = Array.isArray(value) ? value.flatMap((item) => item.split(",")) : value.split(",");
  return [...new Set(parts.map((item) => item.trim()).filter(Boolean))];
}

function appendAll(query: URLSearchParams, key: string, values: string[]): void {
  for (const value of values) query.append(key, value);
}

export default async function PortalDoctorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    name?: string;
    specialty?: string | string[];
    city?: string | string[];
    clinic?: string | string[];
  }>;
}) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  await requireSuperAdmin();
  const queryParams = await searchParams;
  const t = await getTranslations("catalog");
  const common = await getTranslations("common");
  const specialties = toList(queryParams.specialty);
  const cities = toList(queryParams.city);
  const clinics = toList(queryParams.clinic);
  const query = new URLSearchParams();
  if (queryParams.name) query.set("name", queryParams.name);
  appendAll(query, "specialty", specialties);
  appendAll(query, "city", cities);
  appendAll(query, "clinic", clinics);
  const suffix = query.size > 0 ? `?${query}` : "";

  const [doctors, filterOptions] = await Promise.all([
    publicGet<DoctorCard[]>(`/public/doctors${suffix}`),
    publicGet<DoctorFiltersResponse>("/public/doctor-filters"),
  ]);

  return (
    <AdminPortalShell eyebrow={common("SUPER_ADMIN")} title={t("doctorsTitle")}>
      <div className="grid gap-4">
        <DoctorsSearch
          action={getPathname({ locale, href: "/me/doctors" })}
          initialName={queryParams.name ?? ""}
          initialSpecialty={specialties}
          initialCity={cities}
          initialClinic={clinics}
          options={{
            specialties: filterOptions.specialties,
            cities: filterOptions.cities,
            clinics: filterOptions.clinics.map((clinic) => clinic.name),
          }}
          labels={{
            namePlaceholder: t("doctorSearchPlaceholder"),
            nameAria: t("doctorName"),
            specialty: t("specialty"),
            city: t("city"),
            clinic: t("clinic"),
            openFilters: t("openFilters"),
            resetFilters: t("resetFilters"),
            applyFilters: t("applyFilters"),
            selectedCount: t.raw("selectedCount") as string,
            all: t("all"),
          }}
        />
        {doctors.length === 0 ? <EmptyState>{t("emptyDoctorSearch")}</EmptyState> : null}
        <div className="grid gap-5 max-md:gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorTile key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </AdminPortalShell>
  );
}
