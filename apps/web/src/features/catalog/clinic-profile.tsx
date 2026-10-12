import { getTranslations } from "next-intl/server";
import { BookingPanel } from "@/features/booking/booking-panel";
import { initialSlots } from "@/features/booking/initial-slots";
import { FavoriteButton } from "@/features/catalog/favorite-button";
import { Link } from "@/i18n/navigation";
import { formatAmount } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";
import type { ClinicCard, DoctorCard, OfferingCard, ReviewCard } from "@/shared/public-types";
import { Photo } from "@/shared/ui/photo";
import { Rating } from "@/shared/ui/rating";

export type ClinicPageData = ClinicCard & {
  branches: { id: string; name: string; address: string }[];
  doctors: DoctorCard[];
  offerings: OfferingCard[];
  reviews: ReviewCard[];
};

type DoctorHref = (id: string) => `/doctors/${string}` | `/me/favorites/doctors/${string}`;

export async function ClinicProfile({
  clinic,
  saved,
  doctorHref,
  pageHeading = true,
}: {
  clinic: ClinicPageData;
  saved: boolean | null;
  doctorHref: DoctorHref;
  pageHeading?: boolean;
}) {
  const slots = await initialSlots(clinic.offerings[0]);
  return (
    <div className="grid gap-8">
      <ClinicIntro clinic={clinic} saved={saved} pageHeading={pageHeading} />
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] md:items-start">
        <div className="grid gap-10">
          <BranchList branches={clinic.branches} />
          <DoctorList doctors={clinic.doctors} doctorHref={doctorHref} />
          <PriceList offerings={clinic.offerings} />
          <ReviewList reviews={clinic.reviews} />
        </div>
        <div className="sticky-panel">
          <BookingPanel offerings={clinic.offerings} initialSlots={slots} />
        </div>
      </div>
    </div>
  );
}

function ClinicName({ name, pageHeading }: { name: string; pageHeading: boolean }) {
  if (pageHeading) return <h1 className="m-0">{name}</h1>;
  return <h2 className="m-0">{name}</h2>;
}

function ClinicIntro({ clinic, saved, pageHeading }: { clinic: ClinicPageData; saved: boolean | null; pageHeading: boolean }) {
  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-soft">
      <div className="relative aspect-16/7 bg-sand max-md:aspect-16/10">
        <Photo src={clinic.coverUrl} alt={clinic.name} loading="eager" sizes="(max-width: 960px) 100vw, 1200px" />
      </div>
      <div className="grid gap-3 px-6 py-6 max-md:px-5 max-md:py-5">
        {clinic.district ? <p className="kicker">{clinic.district}</p> : null}
        <div className="flex items-start justify-between gap-4">
          <ClinicName name={clinic.name} pageHeading={pageHeading} />
          {saved === null ? null : <FavoriteButton kind="clinic" id={clinic.id} saved={saved} tone="inline" />}
        </div>
        {clinic.description ? <p className="m-0 max-w-[42rem] text-[1.05rem] leading-relaxed text-muted">{clinic.description}</p> : null}
        <p className="m-0 text-[0.95rem] text-muted">{[clinic.address, clinic.phone].filter(Boolean).join(" · ")}</p>
      </div>
    </div>
  );
}

async function BranchList({ branches }: { branches: ClinicPageData["branches"] }) {
  const t = await getTranslations("clinicPage");
  return (
    <section className="grid gap-4">
      <h2>{t("branches")}</h2>
      <div className="grid gap-3">
        {branches.map((branch) => (
          <p key={branch.id} className="m-0 text-muted">
            <span className="text-ink">{branch.name === "Հիմնական" ? t("mainBranch") : branch.name}</span>
            {" · "}
            {branch.address}
          </p>
        ))}
      </div>
    </section>
  );
}

async function DoctorList({ doctors, doctorHref }: { doctors: DoctorCard[]; doctorHref: DoctorHref }) {
  const t = await getTranslations("clinicPage");
  return (
    <section className="grid gap-4">
      <h2>{t("doctors")}</h2>
      <div className="divide-y divide-line overflow-hidden rounded-card bg-surface">
        {doctors.map((doctor) => (
          <Link
            key={doctor.id}
            href={doctorHref(doctor.id)}
            className="flex items-center justify-between gap-3 px-5 py-4 transition-colors duration-160 hover:bg-sand"
          >
            <span className="font-medium">{doctor.user.displayName}</span>
            <span className="text-[0.92rem] text-muted">{doctor.specialty}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function PriceList({ offerings }: { offerings: OfferingCard[] }) {
  const t = await getTranslations("clinicPage");
  const common = await getTranslations("common");
  const services = await getTranslations("services");
  return (
    <section className="grid gap-4">
      <h2>{t("prices")}</h2>
      <div className="divide-y divide-line overflow-hidden rounded-card bg-surface">
        {offerings.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-4">
            <span>
              {item.doctor?.user.displayName} · {localizedServiceName(item.name, services)}
            </span>
            <span className="shrink-0 text-[0.92rem] text-muted">
              {common("price", { amount: formatAmount(item.priceAmd) })}
              {item.isEstimate ? ` · ${common("estimate")}` : ""}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

async function ReviewList({ reviews }: { reviews: ReviewCard[] }) {
  const t = await getTranslations("clinicPage");
  return (
    <section className="grid gap-4">
      <h2>{t("reviews")}</h2>
      {reviews.length === 0 ? <p className="m-0 text-muted">{t("noReviews")}</p> : null}
      {reviews.map((review) => (
        <article key={review.id} className="grid gap-3 rounded-card bg-surface px-5 py-5">
          <Rating value={review.rating} />
          <p className="m-0">{review.body}</p>
          {review.reply ? <p className="m-0 text-muted">{t("reply", { reply: review.reply })}</p> : null}
        </article>
      ))}
    </section>
  );
}
