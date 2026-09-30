import { publicGet } from "@/shared/public-api";
import { JsonForm } from "@/shared/json-form";

type ClinicPageData = {
  id: string;
  name: string;
  description: string;
  address: string;
  offerings: { id: string; name: string; priceAmd: number; isEstimate: boolean; durationMinutes: number }[];
};

export default async function ClinicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clinic = await publicGet<ClinicPageData>(`/public/clinics/${id}`);
  return (
    <section className="grid">
      <h1>{clinic.name}</h1>
      <p>{clinic.description}</p>
      <p className="muted">{clinic.address}</p>
      {clinic.offerings.map((offering) => (
        <article className="card" key={offering.id}>
          <strong>{offering.name}</strong>
          <p>
            {offering.priceAmd} դրամ{offering.isEstimate ? " (գնահատում)" : ""} · {offering.durationMinutes} րոպե
          </p>
          <JsonForm
            action="/appointments"
            label="Գրանցել այց"
            next="/me"
            fields={[
              { name: "offeringId", label: "Ծառայության id" },
              { name: "startsAt", label: "Ժամ (ISO)", type: "text" },
            ]}
          />
        </article>
      ))}
    </section>
  );
}
