import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { AppointmentActions } from "@/features/portal/appointment-actions";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { AskQuestionForm } from "@/features/portal/question-forms";
import { ReviewForm } from "@/features/portal/review-form";
import { Link } from "@/i18n/navigation";
import { asVisitStatus, formatAmount, formatWhen } from "@/shared/format";
import type { AppointmentCard, Me } from "@/shared/public-types";

type Notice = { id: string; body: string; createdAt: string };

type PatientHomeProps = {
  me: Me;
  appointments: AppointmentCard[];
  notices: Notice[];
};

function PortalSection({ id, title, countLabel, children }: { id: string; title: string; countLabel?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2>{title}</h2>
        {countLabel ? <p className="m-0 text-sm text-muted">{countLabel}</p> : null}
      </div>
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{children}</p>;
}

function VisitCard({ item, when, statusLabel, priceLabel }: { item: AppointmentCard; when: string; statusLabel: string; priceLabel: string }) {
  return (
    <article className="grid gap-2 rounded-[1.15rem] border border-line bg-sand/70 px-4 py-4">
      <strong>{item.offering.name}</strong>
      <p className="m-0 text-muted">
        {item.clinic.name} · {item.doctor.user.displayName}
      </p>
      <p className="m-0">
        {when} · {statusLabel} · {priceLabel}
      </p>
      <AppointmentActions id={item.id} status={item.status} mode="patient" />
      {item.status === "COMPLETED" && !item.review ? <ReviewForm appointmentId={item.id} /> : null}
    </article>
  );
}

function AccountField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-line bg-sand/70 px-4 py-4">
      <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">{label}</p>
      <p className="mt-1 mb-0">{value}</p>
    </div>
  );
}

export async function PatientHome({ me, appointments, notices }: PatientHomeProps) {
  const locale = await getLocale();
  const t = await getTranslations("me");
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const nav = await getTranslations("nav");
  const upcoming = appointments.filter((item) => item.status === "REQUESTED" || item.status === "CONFIRMED");
  const reviewed = appointments.filter((item) => item.review);
  const bookClass =
    "inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-accent transition-[background,box-shadow] duration-160 hover:bg-accent-hover";

  return (
    <PatientPortalShell
      eyebrow={common("PATIENT")}
      title={me.displayName}
      action={
        <Link href="/clinics" className={`${bookClass} max-md:hidden`}>
          {t("bookVisit")}
        </Link>
      }
    >
      <div className="grid gap-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-[1.4rem] bg-white px-5 py-5 shadow-soft">
            <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">{t("upcoming")}</p>
            <p className="mt-2 mb-0 font-display text-[2rem] font-bold leading-none text-ink">{upcoming.length}</p>
          </article>
          <article className="rounded-[1.4rem] bg-white px-5 py-5 shadow-soft">
            <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">{portal("statNotices")}</p>
            <p className="mt-2 mb-0 font-display text-[2rem] font-bold leading-none text-ink">{notices.length}</p>
          </article>
          <article className="rounded-[1.4rem] bg-[#2a4a47] px-5 py-5 text-white shadow-soft sm:col-span-2 xl:col-span-1">
            <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-white/60 uppercase">{portal("quickAction")}</p>
            <p className="mt-2 mb-4 text-[1.05rem] font-medium text-white/90">{t("bookHint")}</p>
            <Link href="/clinics" className="inline-flex rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-160 hover:bg-accent-hover">
              {t("bookVisit")}
            </Link>
          </article>
        </section>

        <PortalSection id="visits" title={t("visits")} countLabel={portal("sectionCount", { count: appointments.length })}>
          {appointments.length === 0 ? (
            <EmptyNote>{portal("emptyVisits")}</EmptyNote>
          ) : (
            <div className="grid gap-3">
              {appointments.map((item) => {
                const status = asVisitStatus(item.status);
                return (
                  <VisitCard
                    key={item.id}
                    item={item}
                    when={formatWhen(item.startsAt, locale)}
                    statusLabel={status ? common(status) : item.status}
                    priceLabel={common("price", { amount: formatAmount(item.priceAmd) })}
                  />
                );
              })}
            </div>
          )}
        </PortalSection>

        <PortalSection id="favorites" title={t("favorites")}>
          <EmptyNote>{t("emptyFavorites")}</EmptyNote>
        </PortalSection>

        <PortalSection id="questions" title={nav("questions")}>
          <AskQuestionForm />
        </PortalSection>

        <PortalSection id="reviews" title={t("reviews")} countLabel={portal("sectionCount", { count: reviewed.length })}>
          {reviewed.length === 0 ? (
            <EmptyNote>{t("emptyReviews")}</EmptyNote>
          ) : (
            <div className="grid gap-3">
              {reviewed.map((item) => (
                <article className="grid gap-1 rounded-[1.15rem] border border-line bg-sand/70 px-4 py-4" key={item.id}>
                  <strong>{item.offering.name}</strong>
                  <p className="m-0 text-muted">
                    {item.clinic.name} · {item.doctor.user.displayName}
                  </p>
                  <p className="m-0">{t("reviewSent")}</p>
                </article>
              ))}
            </div>
          )}
        </PortalSection>

        <PortalSection id="notices" title={t("notices")} countLabel={portal("sectionCount", { count: notices.length })}>
          {notices.length === 0 ? (
            <EmptyNote>{t("noNotices")}</EmptyNote>
          ) : (
            <div className="grid gap-3">
              {notices.map((notice) => (
                <p className="m-0 rounded-[1.1rem] border border-line bg-sand/70 px-4 py-3.5" key={notice.id}>
                  {notice.body}
                </p>
              ))}
            </div>
          )}
        </PortalSection>

        <PortalSection id="settings" title={t("settings")}>
          <div className="grid gap-3">
            <AccountField label={t("name")} value={me.displayName} />
            <AccountField label={t("email")} value={me.email} />
            <p className="m-0 text-sm text-muted">{t("settingsHint")}</p>
          </div>
        </PortalSection>
      </div>
    </PatientPortalShell>
  );
}
