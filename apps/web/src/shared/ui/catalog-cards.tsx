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
    <article className="overflow-hidden rounded-card border border-line bg-white shadow-soft transition-[transform,box-shadow,border-color] duration-180 hover:-translate-y-0.5 hover:border-accent/28 hover:shadow-[0_18px_40px_rgba(20,36,40,0.08)]">
      <Link href={`/clinics/${clinic.id}`}>
        <div className="relative aspect-16/10 bg-sand">
          <Photo src={clinic.coverUrl} alt={clinic.name} loading={loading} />
        </div>
        <div className="grid gap-2 px-[18px] pt-4 pb-[18px]">
          <h2 className="text-[1.2rem] leading-snug tracking-[-0.01em]">{clinic.name}</h2>
          <p className="m-0 text-[0.95rem] leading-relaxed text-muted">
            {[clinic.district, clinic.address].filter(Boolean).join(" · ")}
          </p>
        </div>
      </Link>
    </article>
  );
}

export function DoctorTile({ doctor }: { doctor: DoctorCard }) {
  return (
    <article className="overflow-hidden rounded-card border border-line bg-white shadow-soft transition-[transform,box-shadow,border-color] duration-180 hover:-translate-y-0.5 hover:border-accent/28 hover:shadow-[0_18px_40px_rgba(20,36,40,0.08)]">
      <Link href={`/doctors/${doctor.id}`} className="grid grid-cols-[88px_1fr] items-center gap-3.5 px-[18px] py-4">
        <div className="relative aspect-square h-[88px] w-[88px] overflow-hidden rounded-[14px] bg-sand">
          <Photo src={doctor.photoUrl} alt={doctor.user.displayName} />
        </div>
        <div>
          <strong className="font-display text-[1.05rem] leading-snug tracking-[-0.01em] font-semibold">
            {doctor.user.displayName}
          </strong>
          <p className="m-0 mt-0.5 text-[0.95rem] leading-relaxed text-muted">{doctor.specialty}</p>
          <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-accent-soft px-2.5 py-1 text-[0.82rem] font-semibold tracking-[0.01em] text-accent">
            {doctor.clinic.name}
          </span>
        </div>
      </Link>
    </article>
  );
}
