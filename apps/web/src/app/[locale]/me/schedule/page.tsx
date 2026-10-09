import { getTranslations } from "next-intl/server";
import type { HourWindow } from "@/features/clinic/clinic-hours";
import { DoctorPortalShell } from "@/features/portal/doctor-portal-shell";
import { DoctorSchedule } from "@/features/portal/doctor-schedule";
import { PatientSignIn } from "@/features/portal/patient-account";
import { redirect } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

type DoctorHours = { clinic: HourWindow[]; doctor: HourWindow[] };

export default async function DoctorSchedulePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("portal");
  const me = await sessionGet<Me>("/auth/me");
  if (!me) return <PatientSignIn />;
  if (me.role === "SUPER_ADMIN") redirect({ href: "/super-admin", locale });
  if (me.role !== "DOCTOR") redirect({ href: "/me", locale });
  const hours = (await sessionGet<DoctorHours>("/doctors/me/hours")) ?? { clinic: [], doctor: [] };

  return (
    <DoctorPortalShell eyebrow="" title={t("schedule")}>
      <DoctorSchedule clinic={hours.clinic} doctor={hours.doctor} />
    </DoctorPortalShell>
  );
}
