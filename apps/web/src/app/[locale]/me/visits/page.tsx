import { getLocale, getTranslations } from "next-intl/server";
import { loadPatientAccount, PatientSignIn } from "@/features/portal/patient-account";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { VisitBoard } from "@/features/portal/visit-board";
import { prepareLocale } from "@/i18n/locale";
import type { AppointmentCard } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function PatientVisitsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const displayLocale = await getLocale();
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  if (!(await loadPatientAccount(locale))) return <PatientSignIn />;
  const appointments = (await sessionGet<AppointmentCard[]>("/appointments/mine")) ?? [];

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("visits")}>
      <VisitBoard visits={appointments} locale={displayLocale} />
    </PatientPortalShell>
  );
}
