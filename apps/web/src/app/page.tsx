import Link from "next/link";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard, DoctorCard } from "@/shared/public-types";
import { ClinicTile, DoctorTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

type HomeData = { clinics: ClinicCard[]; doctors: DoctorCard[] };

export default async function HomePage() {
  const data = await publicGet<HomeData>("/public/home");
  return (
    <div className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Հայաստան</p>
          <h1>Գտեք կլինիկա և գրանցվեք այցի</h1>
          <p className="lede">Ատամնաբուժական կլինիկաներ, բժիշկներ և ազատ ժամեր մեկ հանգիստ էջում։</p>
          <form className="search" action="/clinics">
            <input name="name" placeholder="Կլինիկայի անուն" aria-label="Կլինիկայի անուն" />
            <button className="btn" type="submit">Փնտրել</button>
          </form>
        </div>
        <div className="stats">
          <p><strong>{data.clinics.length}</strong> կլինիկա</p>
          <p><strong>{data.doctors.length}</strong> բժիշկ</p>
          <p><Link href="/doctors">Բոլոր բժիշկները</Link></p>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <h2>Կլինիկաներ</h2>
          <Link href="/clinics">Տեսնել բոլորը</Link>
        </div>
        {data.clinics.length === 0 ? <EmptyState>Հրապարակված կլինիկա դեռ չկա։</EmptyState> : null}
        <div className="grid-cards">
          {data.clinics.map((clinic) => <ClinicTile key={clinic.id} clinic={clinic} />)}
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <h2>Բժիշկներ</h2>
          <Link href="/doctors">Տեսնել բոլորը</Link>
        </div>
        {data.doctors.length === 0 ? <EmptyState>Հրապարակված բժիշկ դեռ չկա։</EmptyState> : null}
        <div className="grid-cards">
          {data.doctors.map((doctor) => <DoctorTile key={doctor.id} doctor={doctor} />)}
        </div>
      </section>
    </div>
  );
}
