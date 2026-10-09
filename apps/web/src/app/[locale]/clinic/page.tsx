import { getTranslations } from "next-intl/server";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { formatAmount } from "@/shared/format";
import { Link } from "@/i18n/navigation";
import { sessionGet } from "@/shared/session-api";

type Dashboard = { pending: number; today: number; patientCount: number };

const statCard = "grid gap-1 rounded-[1.4rem] bg-white px-5 py-5 shadow-soft transition-shadow duration-160 hover:shadow-accent";

export default async function ClinicDeskPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const desk = await getTranslations("desk");
  const common = await getTranslations("common");
  const me = await requireClinicAdmin();
  const dashboard = (await sessionGet<Dashboard>(`/clinics/${me.clinicId}/dashboard`)) ?? {
    pending: 0,
    today: 0,
    patientCount: 0,
  };

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={me.displayName}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/clinic/visits" className={statCard}>
          <span className="text-[1.7rem] leading-none font-semibold">{formatAmount(dashboard.pending)}</span>
          <span className="text-sm text-muted">{desk("pendingLabel")}</span>
        </Link>
        <Link href="/clinic/visits" className={statCard}>
          <span className="text-[1.7rem] leading-none font-semibold">{formatAmount(dashboard.today)}</span>
          <span className="text-sm text-muted">{desk("todayLabel")}</span>
        </Link>
        <Link href="/clinic/patients" className={statCard}>
          <span className="text-[1.7rem] leading-none font-semibold">{formatAmount(dashboard.patientCount)}</span>
          <span className="text-sm text-muted">{desk("patientList")}</span>
        </Link>
      </div>
    </ClinicManagerShell>
  );
}
