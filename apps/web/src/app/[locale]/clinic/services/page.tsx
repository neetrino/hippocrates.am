import { getTranslations } from "next-intl/server";
import { ClinicServiceBoard } from "@/features/clinic/clinic-service-board";
import { type ClinicOffering, type ServiceDoctor } from "@/features/clinic/clinic-service-list";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";
import { ListPagination, listPage } from "@/shared/ui/list-pagination";

export default async function ClinicServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const page = listPage((await searchParams).page);
  const me = await requireClinicAdmin();
  const [doctors, offerings] = await Promise.all([
    sessionGet<ServiceDoctor[]>(`/clinics/${me.clinicId}/doctors`),
    sessionGet<ClinicOffering[]>(`/clinics/${me.clinicId}/offerings${page > 1 ? `?page=${page}` : ""}`),
  ]);
  const rows = offerings ?? [];

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={portal("services")}>
      <ClinicServiceBoard
        clinicId={me.clinicId}
        doctors={doctors ?? []}
        offerings={rows}
        showEmptyDoctors={page === 1}
      />
      <ListPagination page={page} itemCount={rows.length} />
    </ClinicManagerShell>
  );
}
