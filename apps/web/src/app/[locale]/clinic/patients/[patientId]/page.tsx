import { getLocale, getTranslations } from "next-intl/server";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { Link } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { asVisitStatus, formatAmount, formatWhen } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";
import { sessionGet } from "@/shared/session-api";

type PatientCard = {
  patient: { id: string; displayName: string; email: string; phone: string | null } | null;
  appointments: { id: string; startsAt: string; status: string; priceAmd: number; isEstimate: boolean; offering: { name: string } }[];
};

export default async function ClinicPatientPage({ params }: { params: Promise<{ locale: string; patientId: string }> }) {
  const { locale: raw, patientId } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const t = await getTranslations("desk");
  const common = await getTranslations("common");
  const services = await getTranslations("services");
  const me = await requireClinicAdmin();
  const card = await sessionGet<PatientCard>(`/clinics/${me.clinicId}/patients/${patientId}`);
  if (!card?.patient) {
    return (
      <ClinicManagerShell eyebrow={common("ADMIN")} title={t("patientList")}>
        <p className="m-0 text-muted">{t("patientMissing")}</p>
      </ClinicManagerShell>
    );
  }

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={card.patient.displayName}>
      <div className="grid gap-4">
        <Link href="/clinic/patients" className="w-fit text-sm font-semibold text-accent">
          {t("patientList")}
        </Link>
        <p className="m-0 text-muted">
          {card.patient.email}
          {card.patient.phone ? ` · ${card.patient.phone}` : ""}
        </p>
        <section className="grid gap-3">
          <h2>{t("visits")}</h2>
          {card.appointments.map((item) => {
            const status = asVisitStatus(item.status);
            const price = common("price", { amount: formatAmount(item.priceAmd) });
            return (
              <article className="rounded-[14px] border border-line bg-white px-4 py-3.5" key={item.id}>
                <strong>{localizedServiceName(item.offering.name, services)}</strong>
                <p className="m-0 text-muted">
                  {formatWhen(item.startsAt, locale)} · {status ? common(status) : item.status} · {price}
                  {item.isEstimate ? ` · ${common("estimate")}` : ""}
                </p>
              </article>
            );
          })}
        </section>
      </div>
    </ClinicManagerShell>
  );
}
