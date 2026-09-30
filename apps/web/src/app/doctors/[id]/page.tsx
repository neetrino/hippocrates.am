import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/features/booking/booking-panel";
import { initialSlots } from "@/features/booking/initial-slots";
import { formatAmd } from "@/shared/format";
import { publicGet } from "@/shared/public-api";
import type { DoctorCard, OfferingCard } from "@/shared/public-types";
import { Photo } from "@/shared/ui/photo";

type DoctorPageData = DoctorCard & { offerings: OfferingCard[] };

export default async function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = await publicGet<DoctorPageData>(`/public/doctors/${id}`).catch(() => null);
  if (!doctor) notFound();
  const offerings = doctor.offerings.map((item) => ({ ...item, doctorId: doctor.id }));
  const slots = await initialSlots(offerings[0]);
  return (
    <div className="shell section split">
      <article className="card">
        <div className="media">
          <Photo src={doctor.photoUrl} alt={doctor.user.displayName} />
        </div>
        <div className="card-body">
          <p className="eyebrow">{doctor.specialty}</p>
          <h1>{doctor.user.displayName}</h1>
          <p><Link href={`/clinics/${doctor.clinic.id}`}>{doctor.clinic.name}</Link></p>
          <p className="lede">{doctor.bio}</p>
          <div className="list">
            {offerings.map((item) => (
              <div key={item.id} className="row">
                <span>{item.name}</span>
                <span>{formatAmd(item.priceAmd)} · {item.durationMinutes} րոպե</span>
              </div>
            ))}
          </div>
        </div>
      </article>
      <BookingPanel offerings={offerings} initialSlots={slots} />
    </div>
  );
}
