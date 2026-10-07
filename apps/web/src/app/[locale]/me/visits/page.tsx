import { getLocale, getTranslations } from "next-intl/server";
import { DoctorPortalShell } from "@/features/portal/doctor-portal-shell";
import { PatientSignIn } from "@/features/portal/patient-account";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { VisitBoard } from "@/features/portal/visit-board";
import { redirect } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import type { AppointmentCard, Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function VisitsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const displayLocale = await getLocale();
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  const me = await sessionGet<Me>("/auth/me");
  if (!me) return <PatientSignIn />;
  if (me.role === "SUPER_ADMIN") redirect({ href: "/super-admin", locale });
  if (me.role !== "PATIENT" && me.role !== "DOCTOR") redirect({ href: "/me", locale });

  const appointments = (await sessionGet<AppointmentCard[]>("/appointments/mine")) ?? [];
  const board = <VisitBoard visits={appointments} locale={displayLocale} viewer={me.role === "DOCTOR" ? "doctor" : "patient"} />;

  if (me.role === "DOCTOR") {
    return (
      <DoctorPortalShell eyebrow="" title={t("visits")}>
        {board}
      </DoctorPortalShell>
    );
  }

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("visits")}>
      {board}
    </PatientPortalShell>
  );
}
