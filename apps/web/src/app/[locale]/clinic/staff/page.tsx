import { getLocale, getTranslations } from "next-intl/server";
import { ClinicDayOff } from "@/features/clinic/clinic-day-off";
import { ClinicDoctorForm } from "@/features/clinic/clinic-forms";
import { ClinicHours, type HourWindow } from "@/features/clinic/clinic-hours";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { formatVisitDate } from "@/shared/format";
import { sessionGet } from "@/shared/session-api";

type StaffDoctor = { id: string; specialty: string; user: { displayName: string } };
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
    sessionGet<StaffDoctor[]>(`/clinics/${me.clinicId}/doctors`),
    sessionGet<ClinicHourBook>(`/clinics/${me.clinicId}/hours`),
  ]);
  const staff = (doctors ?? []).map((doctor) => ({ id: doctor.id, name: doctor.user.displayName }));

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={portal("staff")}>
      <div className="grid gap-8">
        <div className="grid gap-3">
          {staff.map((doctor) => (
            <p className="m-0 flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5" key={doctor.id}>
              <span className="font-semibold">{doctor.name}</span>
              <span className="text-muted">{doctors?.find((item) => item.id === doctor.id)?.specialty}</span>
            </p>
          ))}
        </div>
        <ClinicDoctorForm clinicId={me.clinicId} />
        {hours ? (
          <ClinicHours
            clinicId={me.clinicId}
            clinicWindows={hours.clinic}
            doctors={staff.map((doctor) => ({
              id: doctor.id,
              name: doctor.name,
              windows: hours.doctors.find((item) => item.id === doctor.id)?.windows ?? [],
            }))}
          />
        ) : null}
        <ClinicDayOff
          clinicId={me.clinicId}
          doctors={staff}
          days={(hours?.exceptions ?? []).map((day) => ({
            id: day.id,
            doctorId: day.doctorId,
            label: formatVisitDate(day.startsAt, locale),
          }))}
        />
      </div>
    </ClinicManagerShell>
  );
}
