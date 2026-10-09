import { getTranslations } from "next-intl/server";
import { ClinicFinanceRange } from "@/features/clinic/clinic-finance-range";
import { ClinicFinance, type FinanceTotals } from "@/features/clinic/clinic-overview";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";

export default async function ClinicFinancePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { locale: raw } = await params;
  const { from = "", to = "" } = await searchParams;
  prepareLocale(raw);
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const desk = await getTranslations("desk");
  const me = await requireClinicAdmin();
  const query = from && to ? `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` : "";
  const totals = await sessionGet<FinanceTotals>(`/clinics/${me.clinicId}/finance${query}`);

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={portal("finance")}>
      <div className="grid gap-5">
        <ClinicFinanceRange from={from} to={to} />
        {totals ? <ClinicFinance totals={totals} /> : <p className="m-0 text-danger">{from || to ? desk("rangeInvalid") : desk("saveFailed")}</p>}
      </div>
    </ClinicManagerShell>
  );
}
