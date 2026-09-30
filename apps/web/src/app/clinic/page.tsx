import { ClinicForms } from "@/features/clinic/clinic-forms";
import { AppointmentActions } from "@/features/portal/appointment-actions";
import { formatAmd, formatWhen, statusLabel } from "@/shared/format";
import type { AppointmentCard, Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

type StaffDoctor = { id: string; specialty: string; user: { displayName: string; email: string } };
type StaffOffering = { id: string; name: string; priceAmd: number; durationMinutes: number };
type Dashboard = { pending: number; today: number; patientCount: number };

export default async function ClinicDeskPage() {
  const me = await sessionGet<Me>("/auth/me");
  if (!me || me.role !== "ADMIN" || !me.clinicId) {
    return <div className="shell section"><p>Այս էջը կլինիկայի ադմինի համար է։</p></div>;
  }
  const clinicId = me.clinicId;
  const [doctors, offerings, appointments, dashboard] = await Promise.all([
    sessionGet<StaffDoctor[]>(`/clinics/${clinicId}/doctors`),
    sessionGet<StaffOffering[]>(`/clinics/${clinicId}/offerings`),
    sessionGet<AppointmentCard[]>("/appointments/mine"),
    sessionGet<Dashboard>(`/clinics/${clinicId}/dashboard`),
  ]);
  return (
    <div className="shell section stack">
      <h1>Կլինիկայի վահանակ</h1>
      <div className="stats">
        <p><strong>{dashboard?.pending ?? 0}</strong> սպասող հայտ</p>
        <p><strong>{dashboard?.today ?? 0}</strong> այսօր</p>
        <p><strong>{dashboard?.patientCount ?? 0}</strong> պացիենտ</p>
      </div>
      <section className="section">
        <h2>Այցեր</h2>
        <div className="list">
          {(appointments ?? []).map((item) => (
            <article className="row" key={item.id}>
              <div>
                <strong>{item.patient.displayName}</strong>
                <p className="muted">{formatWhen(item.startsAt)} · {item.offering.name} · {statusLabel(item.status)}</p>
              </div>
              <AppointmentActions id={item.id} status={item.status} mode="admin" />
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Բժիշկներ և գներ</h2>
        <div className="list">
          {(doctors ?? []).map((doctor) => (
            <p className="row" key={doctor.id}><span>{doctor.user.displayName}</span><span className="muted">{doctor.specialty}</span></p>
          ))}
          {(offerings ?? []).map((item) => (
            <p className="row" key={item.id}><span>{item.name}</span><span>{formatAmd(item.priceAmd)} · {item.durationMinutes} րոպե</span></p>
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
