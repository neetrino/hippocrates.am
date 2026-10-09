import { getTranslations } from "next-intl/server";
import { ClinicServiceForm } from "@/features/clinic/clinic-forms";
import { ClinicServiceList, type ClinicOffering } from "@/features/clinic/clinic-service-list";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";

type StaffDoctor = { id: string; user: { displayName: string } };

export default async function ClinicServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const me = await requireClinicAdmin();
  const [doctors, offerings] = await Promise.all([
    sessionGet<StaffDoctor[]>(`/clinics/${me.clinicId}/doctors`),
    sessionGet<ClinicOffering[]>(`/clinics/${me.clinicId}/offerings`),
  ]);

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={portal("services")}>
      <div className="grid gap-8">
        <ClinicServiceList clinicId={me.clinicId} offerings={offerings ?? []} />
        <ClinicServiceForm
          clinicId={me.clinicId}
          doctors={(doctors ?? []).map((doctor) => ({ id: doctor.id, name: doctor.user.displayName }))}
        />
      </div>
    </ClinicManagerShell>
  );
}
