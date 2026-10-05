import { getLocale, getTranslations } from "next-intl/server";
import { PatientAvatar } from "@/features/portal/patient-avatar";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { Link } from "@/i18n/navigation";
import { clinicDisplayName, doctorDisplayName } from "@/shared/clinic-label";
import { asVisitStatus, formatTime, formatVisitDate } from "@/shared/format";
import type { AppointmentCard, Me } from "@/shared/public-types";

type Notice = { id: string; body: string; createdAt: string };

type PatientHomeProps = {
  me: Me;
  appointments: AppointmentCard[];
  notices: Notice[];
};

const card = "rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6";

export async function PatientHome({ me, appointments, notices }: PatientHomeProps) {
  const locale = await getLocale();
  const t = await getTranslations("me");
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const upcoming = nearestVisit(appointments);
  const waiting = reviewWaiting(appointments);

  return (
    <PatientPortalShell
      eyebrow={common("PATIENT")}
      title={me.displayName}
      portrait={<PatientAvatar name={me.displayName} photoUrl={me.photoUrl} className="h-12 w-12 text-lg" />}
    >
      <section className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(16rem,0.85fr)]">
        {upcoming ? (
          <NextVisit visit={upcoming} locale={locale} label={t("nextVisit")} statusLabel={statusLabel(upcoming.status, common)} />
        ) : (
          <article className={`${card} flex min-h-56 flex-col justify-between gap-6`}>
            <div>
              <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">{t("nextVisit")}</p>
              <p className="mt-3 mb-0 max-w-md text-[1.15rem] font-medium text-ink">{t("bookHint")}</p>
            </div>
            <Link href="/clinics" className="inline-flex w-fit rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-160 hover:bg-accent-hover">
              {t("bookVisit")}
            </Link>
          </article>
        )}
        <div className="grid gap-3">
          <Link href="/me/notices" className={`${card} block transition-shadow duration-160 hover:shadow-accent`}>
            <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">{portal("statNotices")}</p>
            <p className="mt-2 mb-0 font-display text-[2rem] font-bold leading-none text-ink">{notices.length}</p>
          </Link>
          {waiting ? (
            <Link href="/me/visits" className={`${card} block transition-shadow duration-160 hover:shadow-accent`}>
              <p className="m-0 font-semibold text-ink">{clinicDisplayName(waiting.clinic, locale)}</p>
              <p className="mt-1 mb-0 text-sm text-muted">{t("reviewWaiting")}</p>
            </Link>
          ) : null}
        </div>
      </section>
    </PatientPortalShell>
  );
}

function NextVisit({
  visit,
  locale,
  label,
  statusLabel: status,
}: {
  visit: AppointmentCard;
  locale: string;
  label: string;
  statusLabel: string;
}) {
  return (
    <Link href="/me/visits" className={`${card} block min-h-56 transition-shadow duration-160 hover:shadow-accent`}>
      <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">{label}</p>
      <p className="mt-3 mb-0 font-display text-[2rem] font-bold leading-none text-ink">{formatVisitDate(visit.startsAt, locale)}</p>
      <p className="mt-2 mb-0 text-xl font-semibold text-ink">{formatTime(visit.startsAt)}</p>
      <p className="mt-4 mb-0 text-[1.05rem] font-semibold text-ink">{clinicDisplayName(visit.clinic, locale)}</p>
      <p className="mt-1 mb-0 text-muted">{doctorDisplayName(visit.doctor, locale)}</p>
      {status ? <p className="mt-3 mb-0 text-sm font-semibold text-accent">{status}</p> : null}
    </Link>
  );
}

function statusLabel(status: string, common: (key: "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED") => string): string {
  const known = asVisitStatus(status);
  return known ? common(known) : "";
}

function nearestVisit(appointments: AppointmentCard[]): AppointmentCard | null {
  const upcoming = appointments
    .filter((item) => item.status === "REQUESTED" || item.status === "CONFIRMED")
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  return upcoming[0] ?? null;
}

function reviewWaiting(appointments: AppointmentCard[]): AppointmentCard | null {
  const waiting = appointments
    .filter((item) => item.status === "COMPLETED" && !item.review)
    .sort((left, right) => right.startsAt.localeCompare(left.startsAt));
  return waiting[0] ?? null;
}
