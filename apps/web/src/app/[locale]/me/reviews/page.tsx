import { getTranslations } from "next-intl/server";
import { loadPatientAccount, PatientSignIn } from "@/features/portal/patient-account";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { prepareLocale } from "@/i18n/locale";
import type { AppointmentCard } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function PatientReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("me");
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  if (!(await loadPatientAccount(locale))) return <PatientSignIn />;
  const appointments = (await sessionGet<AppointmentCard[]>("/appointments/mine")) ?? [];
  const reviewed = appointments.filter((item) => item.review);

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("reviews")}>
      <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
        <p className="m-0 mb-4 text-sm text-muted">{portal("sectionCount", { count: reviewed.length })}</p>
        {reviewed.length === 0 ? (
          <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{t("emptyReviews")}</p>
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
      </section>
    </PatientPortalShell>
  );
}
