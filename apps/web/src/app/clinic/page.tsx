import { ClinicForms } from "@/features/clinic/clinic-forms";

export default function ClinicDeskPage() {
  return (
    <section>
      <h1>Կլինիկայի ադմին</h1>
      <p className="muted">Admin-ը գրանցում է բժիշկ միայն իր կլինիկայի համար։</p>
      <ClinicForms />
    </section>
  );
}
