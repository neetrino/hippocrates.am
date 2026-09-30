import Link from "next/link";
import { publicGet } from "@/shared/public-api";

type HomeData = {
  clinics: { id: string; name: string; address: string }[];
  doctors: { id: string; specialty: string; user: { displayName: string } }[];
};

export default async function HomePage() {
  const data = await publicGet<HomeData>("/public/home");
  return (
    <section className="grid">
      <h1>Կլինիկաներ և բժիշկներ</h1>
      <p className="muted">Գրանցվեք որպես պացիենտ և home-ից ընտրեք ցանկացած կլինիկա։</p>
      {data.clinics.map((clinic) => (
        <article className="card" key={clinic.id}>
          <Link href={`/clinics/${clinic.id}`}>{clinic.name}</Link>
          <p className="muted">{clinic.address}</p>
        </article>
      ))}
      {data.doctors.map((doctor) => (
        <article className="card" key={doctor.id}>
          <strong>{doctor.user.displayName}</strong>
          <p className="muted">{doctor.specialty}</p>
        </article>
      ))}
    </section>
  );
}
