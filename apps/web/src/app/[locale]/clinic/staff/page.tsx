import { getLocale, getTranslations } from "next-intl/server";
import { type DoctorRow } from "@/features/clinic/clinic-doctor-editor";
import { type HourWindow } from "@/features/clinic/clinic-hours";
import { ClinicStaffBoard } from "@/features/clinic/clinic-staff-board";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { formatVisitDate } from "@/shared/format";
import { sessionGet } from "@/shared/session-api";

type DayOff = { id: string; doctorId: string; startsAt: string };
type ClinicHourBook = { clinic: HourWindow[]; doctors: { id: string; windows: HourWindow[] }[]; exceptions: DayOff[] };

export default async function ClinicStaffPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const me = await requireClinicAdmin();
  const [doctors, hours] = await Promise.all([
    sessionGet<DoctorRow[]>(`/clinics/${me.clinicId}/doctors`),
    sessionGet<ClinicHourBook>(`/clinics/${me.clinicId}/hours`),
  ]);

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={portal("staff")}>
      <ClinicStaffBoard
        clinicId={me.clinicId}
        doctors={doctors ?? []}
        clinicWindows={hours?.clinic ?? []}
        doctorWindows={hours?.doctors ?? []}
        days={(hours?.exceptions ?? []).map((day) => ({
          id: day.id,
          doctorId: day.doctorId,
          label: formatVisitDate(day.startsAt, locale),
        }))}
      />
    </ClinicManagerShell>
  );
}
