import { Link } from "@/i18n/navigation";
import type { ClinicCard, DoctorCard } from "@/shared/public-types";
import { Photo } from "@/shared/ui/photo";

export function ClinicTile({
  clinic,
  loading,
  href = `/clinics/${clinic.id}`,
}: {
  clinic: ClinicCard;
  loading?: "eager" | "lazy";
  href?: `/clinics/${string}` | `/super-admin/clinics/${string}`;
}) {
  return (
    <article className="overflow-hidden rounded-card border border-line bg-white shadow-soft transition-[transform,box-shadow,border-color] duration-180 hover:-translate-y-0.5 hover:border-accent/28 hover:shadow-[0_18px_40px_rgba(20,36,40,0.08)]">
      <Link href={href}>
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

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M6 14L14 6M8.5 6H14v5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClinicIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5 shrink-0">
      <path
        d="M3.5 17V7.2c0-.4.2-.8.6-1L9.4 3.3c.4-.2.8-.2 1.2 0l5.3 2.9c.4.2.6.6.6 1V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 17v-4.2c0-.4.3-.8.8-.8h4.4c.4 0 .8.4.8.8V17M3.5 17h13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 7.2v3.2M8.4 8.8h3.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoctorTile({ doctor }: { doctor: DoctorCard }) {
  return (
    <article className="group overflow-hidden rounded-[28px] bg-sand shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(20,36,40,0.12)]">
      <Link href={`/doctors/${doctor.id}`} className="relative block aspect-3/4 overflow-hidden">
        <Photo
          src={doctor.photoUrl}
          alt={doctor.user.displayName}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 380px"
        />
        <div className="absolute inset-x-3.5 bottom-3.5 flex items-end gap-3 rounded-[20px] border border-white/50 bg-white/55 px-4 py-3.5 shadow-[0_12px_30px_rgba(20,36,40,0.1)] backdrop-blur-xl transition-[background,border-color] duration-300 group-hover:border-white/65 group-hover:bg-white/68 max-md:inset-x-2.5 max-md:bottom-2.5 max-md:rounded-[18px] max-md:px-3 max-md:py-3">
          <div className="min-w-0 flex-1">
            <strong className="block font-display text-[1.15rem] leading-snug tracking-[-0.01em] font-semibold text-ink">
              {doctor.user.displayName}
            </strong>
            <p className="m-0 mt-1 text-[0.9rem] leading-snug text-muted">{doctor.specialty}</p>
            <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[0.78rem] font-semibold tracking-[0.01em] text-accent">
              <ClinicIcon />
              <span className="min-w-0 break-words">{doctor.clinic.name}</span>
            </span>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-white transition-[background,transform] duration-300 group-hover:bg-accent group-hover:scale-105">
            <ArrowUpRightIcon />
          </span>
        </div>
      </Link>
    </article>
  );
}
