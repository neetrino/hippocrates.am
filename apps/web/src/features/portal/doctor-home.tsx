import { getLocale, getTranslations } from "next-intl/server";
import { PatientAvatar } from "@/features/portal/patient-avatar";
import { DoctorPortalShell } from "@/features/portal/doctor-portal-shell";
import { visitStatusClass } from "@/features/portal/visit-status-style";
import { Link } from "@/i18n/navigation";
import { asVisitStatus, formatTime, formatVisitDate } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";
import type { AppointmentCard, Me } from "@/shared/public-types";

const card = "rounded-[1.6rem] bg-white shadow-soft";

type StatusKey = "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export async function DoctorHome({ me, appointments }: { me: Me; appointments: AppointmentCard[] }) {
  const locale = await getLocale();
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  const services = await getTranslations("services");
  const { hero, listed } = openVisits(appointments);

  return (
    <DoctorPortalShell
      eyebrow=""
      title={me.displayName}
      portrait={<PatientAvatar name={me.displayName} photoUrl={me.photoUrl} className="h-12 w-12 text-lg" />}
    >
      <div className="grid gap-3">
        {hero ? (
          <NextVisit
            visit={hero}
            locale={locale}
            label={t("nextVisit")}
            serviceName={localizedServiceName(hero.offering.name, services)}
            statusLabel={statusText(hero.status, common)}
          />
        ) : (
          <article className={`${card} px-5 py-5`}>
            <p className="m-0 font-display text-2xl font-bold text-ink">{t("noNextVisit")}</p>
            <p className="mt-2 mb-0 text-muted">{t("doctorQuiet")}</p>
          </article>
        )}
        {listed.length > 0 ? (
          <OtherVisits
            title={t("otherVisits")}
            rows={listed.map((visit) => ({
              id: visit.id,
              service: localizedServiceName(visit.offering.name, services),
              when: `${formatVisitDate(visit.startsAt, locale)} · ${formatTime(visit.startsAt)}`,
              patient: visit.patient.displayName,
              status: statusText(visit.status, common),
              statusClass: statusClass(visit.status),
            }))}
          />
        ) : null}
      </div>
    </DoctorPortalShell>
  );
}

function NextVisit({
  visit,
  locale,
  label,
  serviceName,
  statusLabel,
}: {
  visit: AppointmentCard;
  locale: string;
  label: string;
  serviceName: string;
  statusLabel: string;
}) {
  return (
    <Link href="/me/visits" className={`${card} block px-5 py-5 transition-shadow duration-160 hover:shadow-accent`}>
      <p className="m-0 text-sm font-semibold text-muted">{label}</p>
      <p className="mt-2 mb-0 font-display text-[1.65rem] leading-tight font-bold text-ink">{serviceName}</p>
      <p className="mt-2 mb-0 text-ink">
        {formatVisitDate(visit.startsAt, locale)} · {formatTime(visit.startsAt)}
      </p>
      <p className="mt-1 mb-0 text-muted">{visit.patient.displayName}</p>
      {statusLabel ? (
        <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(visit.status)}`}>{statusLabel}</span>
      ) : null}
    </Link>
  );
}

function OtherVisits({
  title,
  rows,
}: {
  title: string;
  rows: { id: string; service: string; when: string; patient: string; status: string; statusClass: string }[];
}) {
  return (
    <section className={`${card} p-2`}>
      <p className="m-0 px-3 pt-3 pb-1 text-sm font-semibold text-muted">{title}</p>
      <ul className="m-0 grid list-none p-0">
        {rows.map((row) => (
          <li key={row.id}>
            <Link href="/me/visits" className="grid gap-1 rounded-[1.1rem] px-3 py-3 transition-colors duration-160 hover:bg-sand">
              <span className="font-semibold text-ink">{row.service}</span>
              <span className="text-sm text-muted">
                {row.when} · {row.patient}
              </span>
              {row.status ? (
                <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${row.statusClass}`}>{row.status}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function openVisits(appointments: AppointmentCard[]): { hero: AppointmentCard | null; listed: AppointmentCard[] } {
  const now = Date.now();
  const open = appointments
    .filter((item) => item.status === "REQUESTED" || item.status === "CONFIRMED")
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  const future = open.filter((item) => Date.parse(item.startsAt) > now);
  const past = open.filter((item) => Date.parse(item.startsAt) <= now);
  return { hero: future[0] ?? null, listed: [...past, ...future.slice(1)].slice(0, 3) };
}

function statusText(status: string, common: (key: StatusKey) => string): string {
  const known = asVisitStatus(status);
  return known ? common(known) : "";
}

function statusClass(status: string): string {
  const known = asVisitStatus(status);
  return known ? visitStatusClass[known] : "bg-sand text-ink";
}
