import { Link } from "@/i18n/navigation";
import type { ClinicCard, DoctorCard } from "@/shared/public-types";
import { Photo } from "@/shared/ui/photo";

export function ClinicTile({
  clinic,
  loading,
  href = `/clinics/${clinic.id}`,
  size = "default",
}: {
  clinic: ClinicCard;
  loading?: "eager" | "lazy";
  href?: `/clinics/${string}` | `/super-admin/clinics/${string}`;
  size?: "default" | "large";
}) {
  const place = [clinic.district, clinic.address].filter(Boolean).join(" · ");
  const large = size === "large";
  return (
    <article className="group overflow-hidden rounded-card bg-surface shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(20,36,40,0.08)]">
      <Link href={href} className="grid">
        <div className={large ? "relative aspect-3/2 min-h-64 overflow-hidden bg-sand" : "relative aspect-16/10 overflow-hidden bg-sand"}>
          <Photo src={clinic.coverUrl} alt={clinic.name} loading={loading} />
        </div>
        <div className={large ? "grid gap-2 px-6 py-5" : "grid gap-1.5 px-5 py-4"}>
          <h3
            className={
              large
                ? "font-display text-[1.4rem] leading-snug font-semibold tracking-[-0.02em]"
                : "font-display text-[1.15rem] leading-snug font-semibold tracking-[-0.02em]"
            }
          >
            {clinic.name}
          </h3>
          {place ? (
            <p className={large ? "m-0 text-[1rem] leading-relaxed text-muted" : "m-0 text-[0.92rem] leading-relaxed text-muted"}>
              {place}
            </p>
          ) : null}
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
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoctorTile({ doctor }: { doctor: DoctorCard }) {
  return (
    <article className="group overflow-hidden rounded-card bg-sand shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(20,36,40,0.08)]">
      <Link href={`/doctors/${doctor.id}`} className="relative block aspect-3/4 overflow-hidden">
        <Photo
          src={doctor.photoUrl}
          alt={doctor.user.displayName}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 380px"
        />
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/80 via-ink/35 to-transparent p-5 pt-16 text-white">
          <strong className="block font-display text-[1.12rem] leading-snug font-semibold tracking-[-0.02em]">
            {doctor.user.displayName}
          </strong>
          <p className="m-0 mt-1 text-[0.88rem] leading-snug text-white/80">{doctor.specialty}</p>
          <span className="mt-3 inline-flex max-w-full items-center gap-2 text-[0.78rem] text-white/75">
            <span className="min-w-0">{doctor.clinic.name}</span>
            <span className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors duration-200 group-hover:bg-accent">
              <ArrowUpRightIcon />
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}
