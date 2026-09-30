import { Link } from "@/i18n/navigation";
import type { ClinicCard, DoctorCard } from "@/shared/public-types";
import { Photo } from "@/shared/ui/photo";

export function ClinicTile({
  clinic,
  loading,
}: {
  clinic: ClinicCard;
  loading?: "eager" | "lazy";
}) {
  return (
    <article className="card">
      <Link href={`/clinics/${clinic.id}`}>
        <div className="media">
          <Photo src={clinic.coverUrl} alt={clinic.name} loading={loading} />
        </div>
        <div className="card-body">
          <h2>{clinic.name}</h2>
          <p className="muted">{[clinic.district, clinic.address].filter(Boolean).join(" · ")}</p>
        </div>
      </Link>
    </article>
  );
}

export function DoctorTile({ doctor }: { doctor: DoctorCard }) {
  return (
    <article className="card">
      <Link href={`/doctors/${doctor.id}`} className="doctor-row card-body">
        <div className="media media-square">
          <Photo src={doctor.photoUrl} alt={doctor.user.displayName} />
        </div>
        <div>
          <strong>{doctor.user.displayName}</strong>
          <p className="muted">{doctor.specialty}</p>
          <p className="muted">{doctor.clinic.name}</p>
        </div>
      </Link>
    </article>
  );
}
