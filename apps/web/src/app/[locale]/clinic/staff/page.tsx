import { getLocale, getTranslations } from "next-intl/server";
import { type DoctorRow } from "@/features/clinic/clinic-doctor-editor";
import { type HourWindow } from "@/features/clinic/clinic-hours";
import { ClinicStaffBoard } from "@/features/clinic/clinic-staff-board";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { formatVisitDate } from "@/shared/format";
import { sessionGet } from "@/shared/session-api";
import { ListPagination, listPage } from "@/shared/ui/list-pagination";

type DayOff = { id: string; doctorId: string; startsAt: string };
type ClinicHourBook = { clinic: HourWindow[]; doctors: { id: string; windows: HourWindow[] }[]; exceptions: DayOff[] };

export default async function ClinicStaffPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const page = listPage((await searchParams).page);
  const suffix = page > 1 ? `?page=${page}` : "";
  const me = await requireClinicAdmin();
  const [doctors, hours] = await Promise.all([
    sessionGet<DoctorRow[]>(`/clinics/${me.clinicId}/doctors${suffix}`),
    sessionGet<ClinicHourBook>(`/clinics/${me.clinicId}/hours${suffix}`),
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
      <ListPagination page={page} itemCount={doctors?.length ?? 0} />
    </ClinicManagerShell>
  );
}
