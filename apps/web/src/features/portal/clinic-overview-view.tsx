import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatAmount, formatWhen } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";
import { Photo } from "@/shared/ui/photo";
import { Rating } from "@/shared/ui/rating";

export type ClinicCopyView = {
  locale: "hy" | "en" | "ru";
  name: string;
  district: string;
  address: string;
  description: string;
};

export type ClinicOverview = {
  id: string;
  phone: string;
  coverUrl: string | null;
  admin: { displayName: string; email: string };
  copies: ClinicCopyView[];
  branches: { id: string; name: string; address: string }[];
  doctors: { id: string; displayName: string; specialty: string; published: boolean }[];
  offerings: { id: string; name: string; priceAmd: number; isEstimate: boolean; durationMinutes: number; doctorName: string }[];
  reviews: { id: string; rating: number; body: string; reply: string | null; createdAt: string }[];
  reviewCount: number;
};

const localeTitle = { hy: "armenian", en: "english", ru: "russian" } as const;

function BackArrow() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="m-0">
      <span className="block text-[0.72rem] font-bold tracking-[0.08em] text-muted uppercase">{label}</span>
      <span className={value ? "text-ink" : "text-muted"}>{value || "—"}</span>
    </p>
  );
}

function Section({ title, extra, children }: { title: string; extra?: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
      <div className="flex items-end justify-between gap-3">
        <h2 className="m-0">{title}</h2>
        {extra ? <p className="m-0 text-sm text-muted">{extra}</p> : null}
      </div>
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{children}</p>;
}

async function ClinicHero({ clinic, source }: { clinic: ClinicOverview; source: ClinicCopyView | undefined }) {
  const platform = await getTranslations("platform");
  return (
    <article className="overflow-hidden rounded-[1.6rem] bg-white shadow-soft">
      <div className="relative aspect-16/10 max-h-[360px] bg-sand">
        <Photo src={clinic.coverUrl} alt={source?.name ?? ""} loading="eager" sizes="(max-width: 960px) 100vw, 720px" />
      </div>
      <div className="grid gap-2 px-5 py-5 md:px-6">
        {source?.district ? <p className="m-0 text-[0.78rem] font-semibold tracking-[0.08em] text-accent uppercase">{source.district}</p> : null}
        {source?.description ? <p className="m-0 max-w-[46rem] text-lg leading-relaxed text-muted">{source.description}</p> : null}
        <Field label={platform("address")} value={source?.address ?? ""} />
        <Field label={platform("phone")} value={clinic.phone} />
      </div>
    </article>
  );
}

async function LanguageSection({ copies }: { copies: ClinicCopyView[] }) {
  const portal = await getTranslations("portal");
  const platform = await getTranslations("platform");
  const common = await getTranslations("common");
  return (
    <Section title={portal("languages")}>
      <div className="grid gap-3 md:grid-cols-3">
        {copies.map((copy) => (
          <article className="grid gap-3 rounded-[1.15rem] border border-line bg-sand/70 px-4 py-4" key={copy.locale}>
            <h3 className="m-0 text-base">{platform(localeTitle[copy.locale])}</h3>
            <Field label={common("name")} value={copy.name} />
            <Field label={platform("district")} value={copy.district} />
            <Field label={platform("address")} value={copy.address} />
            <Field label={platform("description")} value={copy.description} />
          </article>
        ))}
      </div>
    </Section>
  );
}

async function AdminSection({ admin }: { admin: ClinicOverview["admin"] }) {
  const common = await getTranslations("common");
  const auth = await getTranslations("auth");
  return (
    <Section title={common("ADMIN")}>
      <div className="grid gap-3 rounded-[1.15rem] border border-line px-4 py-4 sm:grid-cols-2">
        <Field label={common("name")} value={admin.displayName} />
        <Field label={auth("email")} value={admin.email} />
      </div>
    </Section>
  );
}

async function BranchSection({ branches }: { branches: ClinicOverview["branches"] }) {
  const clinicPage = await getTranslations("clinicPage");
  const portal = await getTranslations("portal");
  return (
    <Section title={clinicPage("branches")} extra={String(branches.length)}>
      {branches.length === 0 ? <EmptyNote>{portal("emptySection")}</EmptyNote> : null}
      <div className="grid gap-3">
        {branches.map((branch) => (
          <p className="m-0 rounded-[1.1rem] border border-line px-4 py-3.5" key={branch.id}>
            {branch.name === "Հիմնական" ? clinicPage("mainBranch") : branch.name}
            {branch.address ? <span className="text-muted"> · {branch.address}</span> : null}
          </p>
        ))}
      </div>
    </Section>
  );
}

async function DoctorSection({ doctors }: { doctors: ClinicOverview["doctors"] }) {
  const clinicPage = await getTranslations("clinicPage");
  const portal = await getTranslations("portal");
  return (
    <Section title={clinicPage("doctors")} extra={String(doctors.length)}>
      {doctors.length === 0 ? <EmptyNote>{portal("emptySection")}</EmptyNote> : null}
      <div className="grid gap-3">
        {doctors.map((doctor) => (
          <div className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-line px-4 py-3.5" key={doctor.id}>
            <p className="m-0">
              <strong>{doctor.displayName}</strong>
              <span className="text-muted"> · {doctor.specialty}</span>
            </p>
            {doctor.published ? null : (
              <span className="shrink-0 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-muted">{portal("hidden")}</span>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

async function ServiceSection({ offerings }: { offerings: ClinicOverview["offerings"] }) {
  const clinicPage = await getTranslations("clinicPage");
  const common = await getTranslations("common");
  const services = await getTranslations("services");
  const portal = await getTranslations("portal");
  return (
    <Section title={clinicPage("prices")} extra={String(offerings.length)}>
      {offerings.length === 0 ? <EmptyNote>{portal("emptySection")}</EmptyNote> : null}
      <div className="grid gap-3">
        {offerings.map((item) => (
          <div className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-line px-4 py-3.5" key={item.id}>
            <span>
              {item.doctorName} · {localizedServiceName(item.name, services)}
            </span>
            <span className="shrink-0 text-right">
              {common("price", { amount: formatAmount(item.priceAmd) })}
              {item.isEstimate ? ` · ${common("estimate")}` : ""}
              <span className="block text-sm text-muted">{common("minutes", { count: item.durationMinutes })}</span>
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

async function ReviewSection({ reviews, reviewCount, locale }: { reviews: ClinicOverview["reviews"]; reviewCount: number; locale: string }) {
  const clinicPage = await getTranslations("clinicPage");
  const portal = await getTranslations("portal");
  const extra = reviewCount > reviews.length ? portal("latestReviews") : String(reviewCount);
  return (
    <Section title={clinicPage("reviews")} extra={extra}>
      {reviews.length === 0 ? <EmptyNote>{clinicPage("noReviews")}</EmptyNote> : null}
      <div className="grid gap-3">
        {reviews.map((review) => (
          <article className="grid gap-2 rounded-[1.15rem] border border-line px-4 py-4" key={review.id}>
            <Rating value={review.rating} />
            <p className="m-0">{review.body}</p>
            {review.reply ? <p className="m-0 text-muted">{clinicPage("reply", { reply: review.reply })}</p> : null}
            <time className="text-sm text-muted" dateTime={review.createdAt}>{formatWhen(review.createdAt, locale)}</time>
          </article>
        ))}
      </div>
    </Section>
  );
}

export async function ClinicOverviewView({ clinic, locale }: { clinic: ClinicOverview; locale: string }) {
  const portal = await getTranslations("portal");
  const source = clinic.copies.find((copy) => copy.locale === "hy");
  return (
    <div className="grid gap-5">
      <Link
        href="/super-admin/clinics"
        className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pr-4 pl-1.5 text-sm font-semibold text-ink shadow-soft transition-[border-color,box-shadow,color] duration-160 hover:border-accent/30 hover:text-accent hover:shadow-[0_10px_24px_rgba(0,167,157,0.16)]"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-accent transition-[background,color] duration-160 group-hover:bg-accent group-hover:text-white">
          <BackArrow />
        </span>
        {portal("backToClinics")}
      </Link>
      <ClinicHero clinic={clinic} source={source} />
      <LanguageSection copies={clinic.copies} />
      <AdminSection admin={clinic.admin} />
      <BranchSection branches={clinic.branches} />
      <DoctorSection doctors={clinic.doctors} />
      <ServiceSection offerings={clinic.offerings} />
      <ReviewSection reviews={clinic.reviews} reviewCount={clinic.reviewCount} locale={locale} />
    </div>
  );
}
