import { getLocale, getTranslations } from "next-intl/server";
import { ClinicForms } from "@/features/clinic/clinic-forms";
import { AppointmentActions } from "@/features/portal/appointment-actions";
import { prepareLocale } from "@/i18n/locale";
import { asVisitStatus, formatAmount, formatWhen } from "@/shared/format";
import type { AppointmentCard, Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";
import { cx } from "@/shared/ui/cx";
import ui from "@/shared/ui/primitives.module.css";

type StaffDoctor = { id: string; specialty: string; user: { displayName: string; email: string } };
type StaffOffering = { id: string; name: string; priceAmd: number; durationMinutes: number };
type Dashboard = { pending: number; today: number; patientCount: number };

export default async function ClinicDeskPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const t = await getTranslations("desk");
  const common = await getTranslations("common");
  const me = await sessionGet<Me>("/auth/me");
  if (!me || me.role !== "ADMIN" || !me.clinicId) {
    return <div className={cx(ui.shell, ui.section)}><p>{t("denied")}</p></div>;
  }
  const clinicId = me.clinicId;
  const [doctors, offerings, appointments, dashboard] = await Promise.all([
    sessionGet<StaffDoctor[]>(`/clinics/${clinicId}/doctors`),
    sessionGet<StaffOffering[]>(`/clinics/${clinicId}/offerings`),
    sessionGet<AppointmentCard[]>("/appointments/mine"),
    sessionGet<Dashboard>(`/clinics/${clinicId}/dashboard`),
  ]);
  return (
    <div className={cx(ui.shell, ui.section, ui.stack)}>
      <h1>{t("title")}</h1>
      <div className={ui.stats}>
        <p>{t.rich("pending", { count: dashboard?.pending ?? 0, strong: (chunks) => <strong>{chunks}</strong> })}</p>
        <p>{t.rich("today", { count: dashboard?.today ?? 0, strong: (chunks) => <strong>{chunks}</strong> })}</p>
        <p>{t.rich("patients", { count: dashboard?.patientCount ?? 0, strong: (chunks) => <strong>{chunks}</strong> })}</p>
      </div>
      <section className={ui.section}>
        <h2>{t("visits")}</h2>
        <div className={ui.list}>
          {(appointments ?? []).map((item) => {
            const status = asVisitStatus(item.status);
            return (
              <article className={ui.row} key={item.id}>
                <div>
                  <strong>{item.patient.displayName}</strong>
                  <p className={ui.muted}>{formatWhen(item.startsAt, locale)} · {item.offering.name} · {status ? common(status) : item.status}</p>
                </div>
                <AppointmentActions id={item.id} status={item.status} mode="admin" />
              </article>
            );
          })}
        </div>
      </section>
      <section className={ui.section}>
        <h2>{t("staff")}</h2>
        <div className={ui.list}>
          {(doctors ?? []).map((doctor) => (
            <p className={ui.row} key={doctor.id}><span>{doctor.user.displayName}</span><span className={ui.muted}>{doctor.specialty}</span></p>
          ))}
          {(offerings ?? []).map((item) => (
            <p className={ui.row} key={item.id}>
              <span>{item.name}</span>
              <span>{common("price", { amount: formatAmount(item.priceAmd) })} · {common("minutes", { count: item.durationMinutes })}</span>
            </p>
          ))}
        </div>
      </section>
      <ClinicForms
        clinicId={clinicId}
        doctors={(doctors ?? []).map((doctor) => ({ id: doctor.id, name: doctor.user.displayName }))}
      />
    </div>
  );
}
