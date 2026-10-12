import { getLocale, getTranslations } from "next-intl/server";
import { PatientAvatar } from "@/features/portal/patient-avatar";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { visitStatusClass } from "@/features/portal/visit-status-style";
import { Link } from "@/i18n/navigation";
import { Photo } from "@/shared/ui/photo";
import { clinicDisplayName, doctorDisplayName } from "@/shared/clinic-label";
import { asVisitStatus, formatTime, formatVisitDate } from "@/shared/format";
import { localizedServiceName, type ServiceMessageKey } from "@/shared/service-name";
import type { AppointmentCard, Me } from "@/shared/public-types";

type PatientHomeProps = {
  me: Me;
  appointments: AppointmentCard[];
};

type ListedVisit = {
  id: string;
  service: string;
  when: string;
  place: string;
  status: string;
  statusClass: string;
  passed: string;
};

const card = "rounded-card bg-surface shadow-soft";

export async function PatientHome({ me, appointments }: PatientHomeProps) {
  const locale = await getLocale();
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  const services = await getTranslations("services");
  const { hero, listed, now } = splitOpen(appointments);
  const review = reviewWaiting(appointments);
  const rows = listed.map((visit) => toListed(visit, locale, now, services, common, t("visitPassed")));

  return (
    <PatientPortalShell
      eyebrow=""
      title={me.displayName}
      portrait={<PatientAvatar name={me.displayName} photoUrl={me.photoUrl} className="h-12 w-12 text-lg" />}
      action={<BookVisit label={t("bookVisit")} />}
    >
      <div className="grid gap-3">
        {hero ? (
          <NextVisit
            visit={hero}
            locale={locale}
            serviceName={localizedServiceName(hero.offering.name, services)}
            statusLabel={statusText(hero.status, common)}
          />
        ) : (
          <EmptyNext title={t("noNextVisit")} hint={t("bookHint")} action={t("bookVisit")} />
        )}
        {review ? <ReviewLine clinic={clinicDisplayName(review.clinic, locale)} label={t("reviewWaiting")} /> : null}
        {rows.length > 0 ? <OtherVisits title={t("otherVisits")} rows={rows} /> : null}
      </div>
    </PatientPortalShell>
  );
}

function BookVisit({ label }: { label: string }) {
  return (
    <Link
      href="/clinics"
      className="btn btn-primary"
    >
      {label}
    </Link>
  );
}

function EmptyNext({ title, hint, action }: { title: string; hint: string; action: string }) {
  return (
    <article className={`${card} px-6 py-8 md:px-8 md:py-10`}>
      <p className="m-0 font-display text-[clamp(2rem,4vw,2.8rem)] leading-[1.05] font-bold text-ink">{title}</p>
      <p className="mt-3 mb-0 max-w-[28rem] text-muted">{hint}</p>
      <Link href="/clinics" className="btn btn-primary mt-6">
        {action}
      </Link>
    </article>
  );
}

function ReviewLine({ clinic, label }: { clinic: string; label: string }) {
  return (
    <Link href="/me/visits" className="flex items-center justify-between gap-3 rounded-card bg-sand px-5 py-3">
      <span className="min-w-0 break-words text-sm text-ink">{clinic}</span>
      <span className="shrink-0 text-sm font-semibold text-accent">{label}</span>
    </Link>
  );
}

function NextVisit({
  visit,
  locale,
  serviceName,
  statusLabel,
}: {
  visit: AppointmentCard;
  locale: string;
  serviceName: string;
  statusLabel: string;
}) {
  const status = asVisitStatus(visit.status);
  const clinic = clinicDisplayName(visit.clinic, locale);
  const doctor = doctorDisplayName(visit.doctor, locale);
  return (
    <Link
      href="/me/visits"
      className={`${card} group grid overflow-hidden transition-shadow duration-160 hover:shadow-accent md:grid-cols-[minmax(0,1fr)_11.5rem]`}
    >
      <div className="grid content-start gap-2 px-6 py-7 md:px-8 md:py-8">
        <p className="m-0 text-sm font-semibold text-muted">{formatVisitDate(visit.startsAt, locale)}</p>
        <p className="m-0 font-display text-[clamp(2.6rem,5vw,3.5rem)] leading-none font-bold tracking-[-0.03em] text-ink">
          {formatTime(visit.startsAt)}
        </p>
        <p className="m-0 pt-2 font-display text-[1.35rem] leading-snug font-semibold text-ink">{serviceName}</p>
        <p className="m-0 font-catalog text-[1.35rem] leading-none font-medium text-muted italic">
          {clinic} · {doctor}
        </p>
        {statusLabel ? (
          <span className={`mt-3 inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${status ? visitStatusClass[status] : "bg-sand text-ink"}`}>
            {statusLabel}
          </span>
        ) : null}
      </div>
      <VisitCover src={visit.clinic.coverUrl} alt={clinic} />
    </Link>
  );
}

function VisitCover({ src, alt }: { src: string | null | undefined; alt: string }) {
  return (
    <div className="relative hidden overflow-hidden bg-sand md:block">
      {src ? <Photo src={src} alt={alt} sizes="184px" /> : null}
    </div>
  );
}

function OtherVisits({ title, rows }: { title: string; rows: ListedVisit[] }) {
  return (
    <section className={`${card} p-2`}>
      <p className="m-0 px-3 pt-4 pb-1 font-catalog text-[1.7rem] leading-none font-medium text-muted italic">{title}</p>
      <ul className="m-0 grid list-none p-0">
        {rows.map((row) => (
          <li key={row.id}>
            <Link href="/me/visits" className="grid gap-1 rounded-[1.1rem] px-3 py-3 transition-colors duration-160 hover:bg-sand">
              <span className="font-semibold text-ink">{row.service}</span>
              <span className="text-sm text-muted">
                {row.when} · {row.place}
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.statusClass}`}>{row.status}</span>
                {row.passed ? <span className="text-xs text-muted">{row.passed}</span> : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function toListed(
  visit: AppointmentCard,
  locale: string,
  now: number,
  services: (key: ServiceMessageKey) => string,
  common: (key: "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED") => string,
  passedLabel: string,
): ListedVisit {
  const status = asVisitStatus(visit.status);
  return {
    id: visit.id,
    service: localizedServiceName(visit.offering.name, services),
    when: `${formatVisitDate(visit.startsAt, locale)} · ${formatTime(visit.startsAt)}`,
    place: `${clinicDisplayName(visit.clinic, locale)} · ${doctorDisplayName(visit.doctor, locale)}`,
    status: statusText(visit.status, common),
    statusClass: status ? visitStatusClass[status] : "bg-sand text-ink",
    passed: Date.parse(visit.startsAt) <= now ? passedLabel : "",
  };
}

function statusText(
  status: string,
  common: (key: "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED") => string,
): string {
  const known = asVisitStatus(status);
  return known ? common(known) : "";
}

function splitOpen(appointments: AppointmentCard[]): { hero: AppointmentCard | null; listed: AppointmentCard[]; now: number } {
  const now = Date.now();
  const open = appointments
    .filter((item) => item.status === "REQUESTED" || item.status === "CONFIRMED")
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  const future = open.filter((item) => Date.parse(item.startsAt) > now);
  const past = open.filter((item) => Date.parse(item.startsAt) <= now);
  return { hero: future[0] ?? null, listed: [...past, ...future.slice(1)].slice(0, 3), now };
}

function reviewWaiting(appointments: AppointmentCard[]): AppointmentCard | null {
  const waiting = appointments
    .filter((item) => item.status === "COMPLETED" && !item.review)
    .sort((left, right) => right.startsAt.localeCompare(left.startsAt));
  return waiting[0] ?? null;
}
