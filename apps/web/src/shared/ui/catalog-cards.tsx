import { Link } from "@/i18n/navigation";
import type { ClinicCard, DoctorCard } from "@/shared/public-types";
import { Photo } from "@/shared/ui/photo";
import { cx } from "@/shared/ui/cx";
import catalog from "@/shared/ui/catalog.module.css";
import primitives from "@/shared/ui/primitives.module.css";

export function ClinicTile({
  clinic,
  loading,
}: {
  clinic: ClinicCard;
  loading?: "eager" | "lazy";
}) {
  return (
    <article className={catalog.card}>
      <Link href={`/clinics/${clinic.id}`}>
        <div className={catalog.media}>
          <Photo src={clinic.coverUrl} alt={clinic.name} loading={loading} />
        </div>
        <div className={catalog.cardBody}>
          <h2>{clinic.name}</h2>
          <p className={primitives.muted}>{[clinic.district, clinic.address].filter(Boolean).join(" · ")}</p>
        </div>
      </Link>
    </article>
  );
}

export function DoctorTile({ doctor }: { doctor: DoctorCard }) {
  return (
    <article className={catalog.card}>
      <Link href={`/doctors/${doctor.id}`} className={cx(catalog.doctorRow, catalog.cardBody)}>
        <div className={cx(catalog.media, catalog.mediaSquare)}>
          <Photo src={doctor.photoUrl} alt={doctor.user.displayName} />
        </div>
        <div>
          <strong>{doctor.user.displayName}</strong>
          <p className={primitives.muted}>{doctor.specialty}</p>
          <span className={primitives.badge}>{doctor.clinic.name}</span>
        </div>
      </Link>
    </article>
  );
}
