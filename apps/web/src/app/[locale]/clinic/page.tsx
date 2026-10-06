import { getLocale, getTranslations } from "next-intl/server";
import { ClinicForms } from "@/features/clinic/clinic-forms";
import { ClinicOverview, type ClinicPatient, type FinanceTotals } from "@/features/clinic/clinic-overview";
import { ClinicHours, type HourWindow } from "@/features/clinic/clinic-hours";
import { ClinicLocaleForm } from "@/features/clinic/clinic-locale-form";
import { AppointmentActions } from "@/features/portal/appointment-actions";
import { prepareLocale } from "@/i18n/locale";
import { asVisitStatus, formatAmount, formatWhen } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";
import type { AppointmentCard, Me } from "@/shared/public-types";
import { PageStack } from "@/shared/ui/page-frame";
import { sessionGet } from "@/shared/session-api";

type StaffDoctor = { id: string; specialty: string; user: { displayName: string; email: string } };
type StaffOffering = { id: string; name: string; priceAmd: number; durationMinutes: number };
type Dashboard = { pending: number; today: number; patientCount: number };
type LocaleDoctor = { id: string; name: string; displayName: string; specialty: string; bio: string };
type LocaleDraft = { name: string; district: string; address: string; description: string; doctors: LocaleDoctor[] };
type ClinicLocales = { en: LocaleDraft; ru: LocaleDraft };
type ClinicHourBook = { clinic: HourWindow[]; doctors: { id: string; windows: HourWindow[] }[] };

export default async function ClinicDeskPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const t = await getTranslations("desk");
  const common = await getTranslations("common");
  const services = await getTranslations("services");
  const me = await sessionGet<Me>("/auth/me");
  if (!me || me.role !== "ADMIN" || !me.clinicId) {
    return (
      <PageStack>
        <p>{t("denied")}</p>
      </PageStack>
    );
  }
  const clinicId = me.clinicId;
  const [doctors, offerings, appointments, dashboard, locales, hours, patients, totals] = await Promise.all([
    sessionGet<StaffDoctor[]>(`/clinics/${clinicId}/doctors`),
    sessionGet<StaffOffering[]>(`/clinics/${clinicId}/offerings`),
    sessionGet<AppointmentCard[]>("/appointments/mine"),
    sessionGet<Dashboard>(`/clinics/${clinicId}/dashboard`),
    sessionGet<ClinicLocales>(`/clinics/${clinicId}/locales`),
    sessionGet<ClinicHourBook>(`/clinics/${clinicId}/hours`),
    sessionGet<ClinicPatient[]>(`/clinics/${clinicId}/patients`),
    sessionGet<FinanceTotals>(`/clinics/${clinicId}/finance`),
  ]);
  return (
    <PageStack>
      <h1>{t("title")}</h1>
      <div className="flex flex-wrap gap-7 text-muted">
        <p>{t.rich("pending", { count: dashboard?.pending ?? 0, strong: (chunks) => <strong className="block text-lg text-ink">{chunks}</strong> })}</p>
        <p>{t.rich("today", { count: dashboard?.today ?? 0, strong: (chunks) => <strong className="block text-lg text-ink">{chunks}</strong> })}</p>
        <p>{t.rich("patients", { count: dashboard?.patientCount ?? 0, strong: (chunks) => <strong className="block text-lg text-ink">{chunks}</strong> })}</p>
      </div>
      {patients && totals ? <ClinicOverview patients={patients} totals={totals} /> : null}
      <section className="grid gap-[18px] pt-7">
        <h2>{t("visits")}</h2>
        <div className="grid gap-3">
          {deskVisits(appointments ?? []).map((item) => {
            const status = asVisitStatus(item.status);
            return (
              <article className="flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5" key={item.id}>
                <div>
                  <strong>{item.patient.displayName}</strong>
                  <p className="m-0 text-muted">{formatWhen(item.startsAt, locale)} · {localizedServiceName(item.offering.name, services)} · {status ? common(status) : item.status}</p>
                </div>
                <AppointmentActions id={item.id} status={item.status} startsAt={item.startsAt} mode="admin" />
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
              <span>{localizedServiceName(item.name, services)}</span>
              <span>{common("price", { amount: formatAmount(item.priceAmd) })} · {common("minutes", { count: item.durationMinutes })}</span>
            </p>
          ))}
        </div>
      </section>
      {hours ? (
        <ClinicHours
          clinicId={clinicId}
          clinicWindows={hours.clinic}
          doctors={(doctors ?? []).map((doctor) => ({
            id: doctor.id,
            name: doctor.user.displayName,
            windows: hours.doctors.find((item) => item.id === doctor.id)?.windows ?? [],
          }))}
        />
      ) : null}
      <ClinicForms
        clinicId={clinicId}
        doctors={(doctors ?? []).map((doctor) => ({ id: doctor.id, name: doctor.user.displayName }))}
      />
      {locales ? <ClinicLocaleForm clinicId={clinicId} texts={locales} /> : null}
    </PageStack>
  );
}

function deskVisits(items: AppointmentCard[]): AppointmentCard[] {
  const now = Date.now();
  const rank = (item: AppointmentCard): number => {
    const started = Date.parse(item.startsAt) <= now;
    if (item.status === "CONFIRMED" && started) return 0;
    if (item.status === "REQUESTED" || item.status === "CONFIRMED") return 1;
    return 2;
  };
  return [...items].sort((left, right) => rank(left) - rank(right) || left.startsAt.localeCompare(right.startsAt));
}
