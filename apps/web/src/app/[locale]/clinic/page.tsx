import { getLocale, getTranslations } from "next-intl/server";
import { ClinicForms } from "@/features/clinic/clinic-forms";
import { AppointmentActions } from "@/features/portal/appointment-actions";
import { prepareLocale } from "@/i18n/locale";
import { asVisitStatus, formatAmount, formatWhen } from "@/shared/format";
import type { AppointmentCard, Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

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
    return (
      <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
        <p>{t("denied")}</p>
      </div>
    );
  }
  const clinicId = me.clinicId;
  const [doctors, offerings, appointments, dashboard] = await Promise.all([
    sessionGet<StaffDoctor[]>(`/clinics/${clinicId}/doctors`),
    sessionGet<StaffOffering[]>(`/clinics/${clinicId}/offerings`),
    sessionGet<AppointmentCard[]>("/appointments/mine"),
    sessionGet<Dashboard>(`/clinics/${clinicId}/dashboard`),
  ]);
  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-3.5 pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      <h1>{t("title")}</h1>
      <div className="flex flex-wrap gap-7 text-muted">
        <p>{t.rich("pending", { count: dashboard?.pending ?? 0, strong: (chunks) => <strong className="block text-lg text-ink">{chunks}</strong> })}</p>
        <p>{t.rich("today", { count: dashboard?.today ?? 0, strong: (chunks) => <strong className="block text-lg text-ink">{chunks}</strong> })}</p>
        <p>{t.rich("patients", { count: dashboard?.patientCount ?? 0, strong: (chunks) => <strong className="block text-lg text-ink">{chunks}</strong> })}</p>
      </div>
      <section className="grid gap-[18px] pt-7">
        <h2>{t("visits")}</h2>
        <div className="grid gap-3">
          {(appointments ?? []).map((item) => {
            const status = asVisitStatus(item.status);
            return (
              <article className="flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5" key={item.id}>
                <div>
                  <strong>{item.patient.displayName}</strong>
                  <p className="m-0 text-muted">{formatWhen(item.startsAt, locale)} · {item.offering.name} · {status ? common(status) : item.status}</p>
                </div>
                <AppointmentActions id={item.id} status={item.status} mode="admin" />
              </article>
            );
          })}
        </div>
      </section>
      <section className="grid gap-[18px] pt-7">
        <h2>{t("staff")}</h2>
        <div className="grid gap-3">
          {(doctors ?? []).map((doctor) => (
            <p className="m-0 flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5" key={doctor.id}>
              <span>{doctor.user.displayName}</span>
              <span className="text-muted">{doctor.specialty}</span>
            </p>
          ))}
          {(offerings ?? []).map((item) => (
            <p className="m-0 flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5" key={item.id}>
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
