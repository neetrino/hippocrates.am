import { getTranslations } from "next-intl/server";
import { BookingPanel } from "@/features/booking/booking-panel";
import { initialSlots } from "@/features/booking/initial-slots";
import { FavoriteButton } from "@/features/catalog/favorite-button";
import { Link } from "@/i18n/navigation";
import { formatAmount } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";
import type { DoctorCard, OfferingCard } from "@/shared/public-types";
import { Photo } from "@/shared/ui/photo";

export type DoctorPageData = DoctorCard & { offerings: OfferingCard[] };

type ClinicHref = `/clinics/${string}` | `/me/favorites/clinics/${string}`;

export async function DoctorProfile({
  doctor,
  saved,
  clinicHref,
  pageHeading = true,
}: {
  doctor: DoctorPageData;
  saved: boolean | null;
  clinicHref: ClinicHref;
  pageHeading?: boolean;
}) {
  const offerings = doctor.offerings.map((item) => ({ ...item, doctorId: doctor.id }));
  const slots = await initialSlots(offerings[0]);
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] md:items-start">
      <DoctorIntro doctor={doctor} offerings={offerings} saved={saved} clinicHref={clinicHref} pageHeading={pageHeading} />
      <div className="sticky-panel">
        <BookingPanel offerings={offerings} initialSlots={slots} />
      </div>
    </div>
  );
}

function DoctorName({ name, pageHeading }: { name: string; pageHeading: boolean }) {
  if (pageHeading) return <h1 className="m-0">{name}</h1>;
  return <h2 className="m-0">{name}</h2>;
}

function DoctorIntro({
  doctor,
  offerings,
  saved,
  clinicHref,
  pageHeading,
}: {
  doctor: DoctorPageData;
  offerings: OfferingCard[];
  saved: boolean | null;
  clinicHref: ClinicHref;
  pageHeading: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-card bg-surface shadow-soft">
      <div className="flex items-center justify-center bg-sand">
        <Photo
          src={doctor.photoUrl}
          alt={doctor.user.displayName}
          sizes="(max-width: 768px) 100vw, 70vw"
          fit="contain"
        />
      </div>
      <div className="grid gap-3 px-6 py-6 max-md:px-5 max-md:py-5">
        <p className="kicker">{doctor.specialty}</p>
        <div className="flex items-start justify-between gap-4">
          <DoctorName name={doctor.user.displayName} pageHeading={pageHeading} />
          {saved === null ? null : <FavoriteButton kind="doctor" id={doctor.id} saved={saved} tone="inline" />}
        </div>
        <p className="m-0">
          <Link href={clinicHref} className="text-accent hover:text-accent-hover">
            {doctor.clinic.name}
          </Link>
        </p>
        {doctor.bio ? <p className="m-0 max-w-[42rem] text-[1.05rem] leading-relaxed text-muted">{doctor.bio}</p> : null}
        <ServiceList offerings={offerings} />
      </div>
    </article>
  );
}

async function ServiceList({ offerings }: { offerings: OfferingCard[] }) {
  const t = await getTranslations("common");
  const services = await getTranslations("services");
  return (
    <div className="mt-2 divide-y divide-line overflow-hidden rounded-card border border-line">
      {offerings.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
          <span>{localizedServiceName(item.name, services)}</span>
          <span className="shrink-0 text-[0.92rem] text-muted">
            {t("price", { amount: formatAmount(item.priceAmd) })} · {t("minutes", { count: item.durationMinutes })}
          </span>
        </div>
      ))}
    </div>
  );
}
