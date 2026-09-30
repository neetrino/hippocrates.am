import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/features/booking/booking-panel";
import { initialSlots } from "@/features/booking/initial-slots";
import { formatAmd } from "@/shared/format";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard, DoctorCard, OfferingCard, ReviewCard } from "@/shared/public-types";
import { Photo } from "@/shared/ui/photo";
import { Rating } from "@/shared/ui/rating";

type ClinicPageData = ClinicCard & {
  branches: { id: string; name: string; address: string }[];
  doctors: DoctorCard[];
  offerings: OfferingCard[];
  reviews: ReviewCard[];
};

export default async function ClinicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clinic = await publicGet<ClinicPageData>(`/public/clinics/${id}`).catch(() => null);
  if (!clinic) notFound();
  const slots = await initialSlots(clinic.offerings[0]);
  return (
    <div className="shell section">
      <div className="card">
        <div className="media">
          <Photo src={clinic.coverUrl} alt={clinic.name} />
        </div>
        <div className="card-body">
          <p className="eyebrow">{clinic.district}</p>
          <h1>{clinic.name}</h1>
          <p className="lede">{clinic.description}</p>
          <p className="muted">{clinic.address}</p>
          <p className="muted">{clinic.phone}</p>
        </div>
      </div>
      <div className="split">
        <div className="stack">
          <section className="section">
            <h2>Մասնաճյուղեր</h2>
            {clinic.branches.map((branch) => (
              <p key={branch.id}>{branch.name} · {branch.address}</p>
            ))}
          </section>
          <section className="section">
            <h2>Բժիշկներ</h2>
            <div className="list">
              {clinic.doctors.map((doctor) => (
                <Link key={doctor.id} href={`/doctors/${doctor.id}`} className="row">
                  <span>{doctor.user.displayName}</span>
                  <span className="muted">{doctor.specialty}</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="section">
            <h2>Գներ</h2>
            <div className="list">
              {clinic.offerings.map((item) => (
                <div key={item.id} className="row">
                  <span>{item.doctor?.user.displayName} · {item.name}</span>
                  <span>{formatAmd(item.priceAmd)}{item.isEstimate ? " · գնահատում" : ""}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="section">
            <h2>Կարծիքներ</h2>
            {clinic.reviews.length === 0 ? <p className="muted">Կարծիք դեռ չկա։</p> : null}
            {clinic.reviews.map((review) => (
              <article key={review.id} className="panel">
                <Rating value={review.rating} />
                <p>{review.body}</p>
                {review.reply ? <p className="muted">Կլինիկա. {review.reply}</p> : null}
              </article>
            ))}
          </section>
        </div>
        <BookingPanel offerings={clinic.offerings} initialSlots={slots} />
      </div>
    </div>
  );
}
