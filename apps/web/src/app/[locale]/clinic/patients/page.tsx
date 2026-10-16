import { getTranslations } from "next-intl/server";
import { ClinicPatientList, type ClinicPatient } from "@/features/clinic/clinic-overview";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";
import { ListPagination, listPage } from "@/shared/ui/list-pagination";

export default async function ClinicPatientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const page = listPage((await searchParams).page);
  const desk = await getTranslations("desk");
  const common = await getTranslations("common");
  const me = await requireClinicAdmin();
  const suffix = page > 1 ? `?page=${page}` : "";
  const patients = (await sessionGet<ClinicPatient[]>(`/clinics/${me.clinicId}/patients${suffix}`)) ?? [];

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={desk("patientList")}>
      <ClinicPatientList patients={patients} />
      <ListPagination page={page} itemCount={patients.length} />
    </ClinicManagerShell>
  );
}
