import { publicGet } from "@/shared/public-api";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

export default async function ClinicsPage({ searchParams }: { searchParams: Promise<{ name?: string }> }) {
  const { name } = await searchParams;
  const query = name ? `?name=${encodeURIComponent(name)}` : "";
  const clinics = await publicGet<ClinicCard[]>(`/public/clinics${query}`);
  return (
    <div className="shell section">
      <h1>Կլինիկաներ</h1>
      <form className="search" action="/clinics">
        <input name="name" defaultValue={name ?? ""} placeholder="Անուն" aria-label="Կլինիկայի անուն" />
        <button className="btn" type="submit">Փնտրել</button>
      </form>
      {clinics.length === 0 ? <EmptyState>Այս անունով կլինիկա չկա։</EmptyState> : null}
      <div className="grid-cards">
        {clinics.map((clinic) => <ClinicTile key={clinic.id} clinic={clinic} />)}
      </div>
    </div>
  );
}
