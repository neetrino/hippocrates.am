import { publicGet } from "@/shared/public-api";
import type { DoctorCard } from "@/shared/public-types";
import { DoctorTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; specialty?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.name) query.set("name", params.name);
  if (params.specialty) query.set("specialty", params.specialty);
  const suffix = query.size > 0 ? `?${query}` : "";
  const doctors = await publicGet<DoctorCard[]>(`/public/doctors${suffix}`);
  return (
    <div className="shell section">
      <h1>Բժիշկներ</h1>
      <form className="search" action="/doctors">
        <input name="name" defaultValue={params.name ?? ""} placeholder="Անուն" aria-label="Բժշկի անուն" />
        <input name="specialty" defaultValue={params.specialty ?? ""} placeholder="Մասնագիտություն" aria-label="Մասնագիտություն" />
        <button className="btn" type="submit">Փնտրել</button>
      </form>
      {doctors.length === 0 ? <EmptyState>Այս փնտրմամբ բժիշկ չկա։</EmptyState> : null}
      <div className="grid-cards">
        {doctors.map((doctor) => <DoctorTile key={doctor.id} doctor={doctor} />)}
      </div>
    </div>
  );
}
