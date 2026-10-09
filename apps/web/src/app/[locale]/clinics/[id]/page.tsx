import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/features/booking/booking-panel";
import { initialSlots } from "@/features/booking/initial-slots";
import { Link } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { formatAmount } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard, DoctorCard, OfferingCard, ReviewCard } from "@/shared/public-types";
import { Breadcrumb } from "@/shared/ui/breadcrumb";
import { PageStack } from "@/shared/ui/page-frame";
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
  const locale = prepareLocale(raw);
  const clinic = await publicGet<ClinicPageData>(`/public/clinics/${id}`, locale).catch(() => null);
  if (!clinic) notFound();
  const t = await getTranslations("clinicPage");
  const catalog = await getTranslations("catalog");
  const common = await getTranslations("common");
  const services = await getTranslations("services");
  const slots = await initialSlots(clinic.offerings[0]);
  return (
    <PageStack>
      <Breadcrumb
        items={[
          { href: "/", label: common("homeLink") },
          { href: "/clinics", label: catalog("clinicsTitle") },
          { label: clinic.name },
        ]}
      />
      <div className="overflow-hidden rounded-card bg-surface shadow-soft">
        <div className="relative aspect-16/7 bg-sand max-md:aspect-16/10">
          <Photo src={clinic.coverUrl} alt={clinic.name} loading="eager" sizes="(max-width: 960px) 100vw, 1200px" />
        </div>
        <div className="grid gap-3 px-6 py-6 max-md:px-5 max-md:py-5">
          {clinic.district ? <p className="kicker">{clinic.district}</p> : null}
          <h1>{clinic.name}</h1>
          {clinic.description ? (
            <p className="m-0 max-w-[42rem] text-[1.05rem] leading-relaxed text-muted">{clinic.description}</p>
          ) : null}
          <p className="m-0 text-[0.95rem] text-muted">{[clinic.address, clinic.phone].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] md:items-start">
        <div className="grid gap-10">
          <section className="grid gap-4">
            <h2>{t("branches")}</h2>
            <div className="grid gap-3">
              {clinic.branches.map((branch) => (
                <p key={branch.id} className="m-0 text-muted">
                  <span className="text-ink">{branch.name === "Հիմնական" ? t("mainBranch") : branch.name}</span>
                  {" · "}
                  {branch.address}
                </p>
              ))}
            </div>
          </section>
          <section className="grid gap-4">
            <h2>{t("doctors")}</h2>
            <div className="divide-y divide-line overflow-hidden rounded-card bg-surface">
              {clinic.doctors.map((doctor) => (
                <Link
                  key={doctor.id}
                  href={`/doctors/${doctor.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors duration-160 hover:bg-sand"
                >
                  <span className="font-medium">{doctor.user.displayName}</span>
                  <span className="text-[0.92rem] text-muted">{doctor.specialty}</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="grid gap-4">
            <h2>{t("prices")}</h2>
            <div className="divide-y divide-line overflow-hidden rounded-card bg-surface">
              {clinic.offerings.map((item) => (
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
          <section className="grid gap-4">
            <h2>{t("reviews")}</h2>
            {clinic.reviews.length === 0 ? <p className="m-0 text-muted">{t("noReviews")}</p> : null}
            {clinic.reviews.map((review) => (
              <article key={review.id} className="grid gap-3 rounded-card bg-surface px-5 py-5">
                <Rating value={review.rating} />
                <p className="m-0">{review.body}</p>
                {review.reply ? <p className="m-0 text-muted">{t("reply", { reply: review.reply })}</p> : null}
              </article>
            ))}
          </section>
        </div>
        <div className="sticky-panel">
          <BookingPanel offerings={clinic.offerings} initialSlots={slots} />
        </div>
      </div>
    </PageStack>
  );
}
