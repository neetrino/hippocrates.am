import { getLocale, getTranslations } from "next-intl/server";
import { DoctorPortalShell } from "@/features/portal/doctor-portal-shell";
import { PatientSignIn } from "@/features/portal/patient-account";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { VisitBoard } from "@/features/portal/visit-board";
import { redirect } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import type { AppointmentCard, Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";
import { ListPagination, listPage } from "@/shared/ui/list-pagination";

export default async function VisitsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const displayLocale = await getLocale();
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  const page = listPage((await searchParams).page);
  const me = await sessionGet<Me>("/auth/me");
  if (!me) return <PatientSignIn />;
  if (me.role === "SUPER_ADMIN") redirect({ href: "/super-admin", locale });
  if (me.role !== "PATIENT" && me.role !== "DOCTOR") redirect({ href: "/me", locale });

  const suffix = page > 1 ? `?page=${page}` : "";
  const appointments = (await sessionGet<AppointmentCard[]>(`/appointments/mine${suffix}`)) ?? [];
  const board = (
    <>
      <VisitBoard visits={appointments} locale={displayLocale} viewer={me.role === "DOCTOR" ? "doctor" : "patient"} />
      <ListPagination page={page} itemCount={appointments.length} />
    </>
  );

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
