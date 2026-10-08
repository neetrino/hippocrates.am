import { getLocale, getTranslations } from "next-intl/server";
import { DoctorHome } from "@/features/portal/doctor-home";
import { LogoutButton } from "@/features/portal/logout-button";
import { PatientHome } from "@/features/portal/patient-home";
import { Link, redirect } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { clinicDisplayName, doctorDisplayName } from "@/shared/clinic-label";
import { asRole, asVisitStatus, formatAmount, formatWhen } from "@/shared/format";
import { noticeMessageKey } from "@/shared/notice-text";
import { localizedServiceName } from "@/shared/service-name";
import type { AppointmentCard, Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

type Notice = {
  id: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  appointment: {
    startsAt: string;
    clinic: { name: string; locales?: { locale: string; name: string }[] };
    doctor: { user: { displayName: string }; locales?: { locale: string; name: string }[] };
  } | null;
};

export default async function MePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const displayLocale = await getLocale();
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  const services = await getTranslations("services");
  const nav = await getTranslations("nav");
  const me = await sessionGet<Me>("/auth/me");
  if (!me) {
    return (
      <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
        <p>
          {t("signIn")} <Link href="/login">{nav("login")}</Link>
        </p>
      </div>
    );
  }

  if (me.role === "SUPER_ADMIN") {
    redirect({ href: "/super-admin", locale });
  }
  if (me.role === "ADMIN") {
    redirect({ href: "/clinic", locale });
  }

  const appointments = (await sessionGet<AppointmentCard[]>("/appointments/mine")) ?? [];

  if (me.role === "PATIENT") {
    return <PatientHome me={me} appointments={appointments} />;
  }

  if (me.role === "DOCTOR") {
    return <DoctorHome me={me} appointments={appointments} />;
  }

  const notices = (await sessionGet<Notice[]>("/me/notifications")) ?? [];

  const role = asRole(me.role);
  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-3.5 pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      <div className="flex items-end justify-between gap-3 max-md:items-center">
        <div>
          <p className="mb-3 text-[0.78rem] font-semibold tracking-[0.08em] text-accent uppercase">
            {role ? common(role) : me.role}
          </p>
          <h1>{me.displayName}</h1>
        </div>
        <LogoutButton />
      </div>
      <section className="grid gap-[18px] pt-7">
        <h2>{t("visits")}</h2>
        <div className="grid gap-3">
          {appointments.map((item) => {
            const status = asVisitStatus(item.status);
            return (
              <article className="grid gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft" key={item.id}>
                <strong>{localizedServiceName(item.offering.name, services)}</strong>
                <p className="m-0 text-muted">
                  {`${clinicDisplayName(item.clinic, displayLocale)} · ${doctorDisplayName(item.doctor, displayLocale)}`}
                </p>
                <p>
                  {formatWhen(item.startsAt, displayLocale)} · {status ? common(status) : item.status} ·{" "}
                  {common("price", { amount: formatAmount(item.priceAmd) })}
                </p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="grid gap-[18px] pt-7">
        <h2>{t("notices")}</h2>
        {notices.length === 0 ? <p className="m-0 text-muted">{t("noNotices")}</p> : null}
        {notices.map((notice) => {
          const messageKey = noticeMessageKey(notice.body);
          const visit = notice.appointment;
          const context = visit
            ? `${clinicDisplayName(visit.clinic, displayLocale)} · ${doctorDisplayName(visit.doctor, displayLocale)} · ${formatWhen(visit.startsAt, displayLocale)}`
            : "";
          return (
            <div className="grid gap-1 rounded-[14px] border border-line bg-white px-4 py-3.5" key={notice.id}>
              <div className="flex items-center justify-between gap-3">
                <span>{messageKey ? t(messageKey) : notice.body}</span>
                <time className="shrink-0 text-sm text-muted" dateTime={notice.createdAt}>
                  {formatWhen(notice.createdAt, displayLocale)}
                </time>
              </div>
              {context ? <p className="m-0 text-sm text-muted">{context}</p> : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}
