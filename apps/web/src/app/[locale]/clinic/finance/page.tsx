import { getTranslations } from "next-intl/server";
import { ClinicFinance, type FinanceTotals } from "@/features/clinic/clinic-overview";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";

export default async function ClinicFinancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const me = await requireClinicAdmin();
  const totals = (await sessionGet<FinanceTotals>(`/clinics/${me.clinicId}/finance`)) ?? {
    REQUESTED: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
  };

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={portal("finance")}>
      <ClinicFinance totals={totals} />
    </ClinicManagerShell>
  );
}
