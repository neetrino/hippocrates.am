import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/features/booking/booking-panel";
import { initialSlots } from "@/features/booking/initial-slots";
import { Link } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { formatAmount } from "@/shared/format";
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

export default async function ClinicPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: raw, id } = await params;
  prepareLocale(raw);
  const clinic = await publicGet<ClinicPageData>(`/public/clinics/${id}`).catch(() => null);
  if (!clinic) notFound();
  const t = await getTranslations("clinicPage");
  const common = await getTranslations("common");
  const slots = await initialSlots(clinic.offerings[0]);
  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      <div className="overflow-hidden rounded-card border border-line bg-white shadow-soft">
        <div className="relative aspect-16/10 bg-sand">
          <Photo src={clinic.coverUrl} alt={clinic.name} loading="eager" />
        </div>
        <div className="grid gap-2 px-[18px] pt-4 pb-[18px]">
          <p className="mb-3 text-[0.78rem] font-semibold tracking-[0.08em] text-accent uppercase">{clinic.district}</p>
          <h1>{clinic.name}</h1>
          <p className="m-0 max-w-[42rem] text-lg leading-relaxed text-muted">{clinic.description}</p>
          <p className="m-0 text-muted">{clinic.address}</p>
          <p className="m-0 text-muted">{clinic.phone}</p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-[1.3fr_0.7fr] md:items-start">
        <div className="grid gap-3.5">
          <section className="grid gap-[18px] pt-7">
            <h2>{t("branches")}</h2>
            {clinic.branches.map((branch) => (
              <p key={branch.id}>{branch.name} · {branch.address}</p>
            ))}
          </section>
          <section className="grid gap-[18px] pt-7">
            <h2>{t("doctors")}</h2>
            <div className="grid gap-3">
              {clinic.doctors.map((doctor) => (
                <Link key={doctor.id} href={`/doctors/${doctor.id}`} className="flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5">
                  <span>{doctor.user.displayName}</span>
                  <span className="text-muted">{doctor.specialty}</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="grid gap-[18px] pt-7">
            <h2>{t("prices")}</h2>
            <div className="grid gap-3">
              {clinic.offerings.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5">
                  <span>{item.doctor?.user.displayName} · {item.name}</span>
                  <span>
                    {common("price", { amount: formatAmount(item.priceAmd) })}
                    {item.isEstimate ? ` · ${common("estimate")}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="grid gap-[18px] pt-7">
            <h2>{t("reviews")}</h2>
            {clinic.reviews.length === 0 ? <p className="m-0 text-muted">{t("noReviews")}</p> : null}
            {clinic.reviews.map((review) => (
              <article key={review.id} className="grid gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft">
                <Rating value={review.rating} />
                <p>{review.body}</p>
                {review.reply ? <p className="m-0 text-muted">{t("reply", { reply: review.reply })}</p> : null}
              </article>
            ))}
          </section>
        </div>
        <BookingPanel offerings={clinic.offerings} initialSlots={slots} />
      </div>
    </div>
  );
}
