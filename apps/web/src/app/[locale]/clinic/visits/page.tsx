import { getLocale, getTranslations } from "next-intl/server";
import { ClinicVisitBoard } from "@/features/clinic/clinic-visit-board";
import { DeskBooking, type DeskDoctor, type DeskService } from "@/features/clinic/desk-booking";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { formatWhen } from "@/shared/format";
import type { AppointmentCard } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function ClinicVisitsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const meLabel = await getTranslations("me");
  const common = await getTranslations("common");
  const me = await requireClinicAdmin();
  const [appointments, doctors, offerings] = await Promise.all([
    sessionGet<AppointmentCard[]>("/appointments/mine"),
    sessionGet<DeskDoctor[]>(`/clinics/${me.clinicId}/doctors`),
    sessionGet<DeskService[]>(`/clinics/${me.clinicId}/offerings`),
  ]);

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={meLabel("visits")}>
      <div className="grid gap-5">
        <DeskBooking clinicId={me.clinicId} doctors={doctors ?? []} offerings={offerings ?? []} />
        <ClinicVisitBoard visits={deskVisits(appointments ?? []).map((item) => ({ ...item, when: formatWhen(item.startsAt, locale) }))} />
      </div>
    </ClinicManagerShell>
  );
}

function deskVisits(items: AppointmentCard[]): AppointmentCard[] {
  const now = Date.now();
  const rank = (item: AppointmentCard): number => {
    const started = Date.parse(item.startsAt) <= now;
    if (item.status === "CONFIRMED" && started) return 0;
    if (item.status === "REQUESTED" || item.status === "CONFIRMED") return 1;
    return 2;
  };
  return [...items].sort((left, right) => rank(left) - rank(right) || left.startsAt.localeCompare(right.startsAt));
}
