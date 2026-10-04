import { getLocale, getTranslations } from "next-intl/server";
import { AppointmentActions } from "@/features/portal/appointment-actions";
import { loadPatientAccount, PatientSignIn } from "@/features/portal/patient-account";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { ReviewForm } from "@/features/portal/review-form";
import { prepareLocale } from "@/i18n/locale";
import { asVisitStatus, formatAmount, formatWhen } from "@/shared/format";
import type { AppointmentCard } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function PatientVisitsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const displayLocale = await getLocale();
  const t = await getTranslations("me");
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  if (!(await loadPatientAccount(locale))) return <PatientSignIn />;
  const appointments = (await sessionGet<AppointmentCard[]>("/appointments/mine")) ?? [];

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("visits")}>
      <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
        <p className="m-0 mb-4 text-sm text-muted">{portal("sectionCount", { count: appointments.length })}</p>
        {appointments.length === 0 ? (
          <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{portal("emptyVisits")}</p>
        ) : (
          <div className="grid gap-3">
            {appointments.map((item) => {
              const status = asVisitStatus(item.status);
              return (
                <article className="grid gap-2 rounded-[1.15rem] border border-line bg-sand/70 px-4 py-4" key={item.id}>
                  <strong>{item.offering.name}</strong>
                  <p className="m-0 text-muted">
                    {item.clinic.name} · {item.doctor.user.displayName}
                  </p>
                  <p className="m-0">
                    {formatWhen(item.startsAt, displayLocale)} · {status ? common(status) : item.status} ·{" "}
                    {common("price", { amount: formatAmount(item.priceAmd) })}
                  </p>
                  <AppointmentActions id={item.id} status={item.status} mode="patient" />
                  {item.status === "COMPLETED" && !item.review ? <ReviewForm appointmentId={item.id} /> : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PatientPortalShell>
  );
}
