import { getTranslations } from "next-intl/server";
import { ClinicPatientList, type ClinicPatient } from "@/features/clinic/clinic-overview";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";

export default async function ClinicPatientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const desk = await getTranslations("desk");
  const common = await getTranslations("common");
  const me = await requireClinicAdmin();
  const patients = (await sessionGet<ClinicPatient[]>(`/clinics/${me.clinicId}/patients`)) ?? [];

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={desk("patientList")}>
      <ClinicPatientList patients={patients} />
    </ClinicManagerShell>
  );
}
