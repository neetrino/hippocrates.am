import { Link } from "@/i18n/navigation";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";
import { HomeBanner, HomeDisplayTitle } from "@/features/home/home-banner";

export function HomeCatalog({
  clinicsTitle,
  seeAll,
  emptyClinics,
  clinics,
}: {
  clinicsTitle: string;
  seeAll: string;
  emptyClinics: string;
  clinics: ClinicCard[];
}) {
  const [featured, ...rest] = clinics;

  return (
    <section className="page-shell-wide grid gap-8 pt-10 max-md:gap-6 max-md:pt-7">
      <div className="relative flex flex-col items-center gap-1 md:block">
        <h2 className="text-center font-catalog text-[clamp(2.8rem,4.4vw,3.7rem)] leading-[0.82] font-medium tracking-[-0.02em] text-muted italic">
          {clinicsTitle}
        </h2>
        <Link
          href="/clinics"
          className="btn btn-ghost md:absolute md:top-1/2 md:right-0 md:-translate-y-1/2"
        >
          {seeAll}
        </Link>
      </div>
      {clinics.length === 0 ? <EmptyState>{emptyClinics}</EmptyState> : null}
      {featured ? <FeaturedClinic clinic={featured} /> : null}
      {rest.length > 0 ? (
        <div className="grid gap-6 max-md:gap-4 md:grid-cols-2">
          {rest.map((clinic) => (
            <ClinicTile key={clinic.id} clinic={clinic} size="large" />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function FeaturedClinic({ clinic }: { clinic: ClinicCard }) {
  const place = [clinic.district, clinic.address].filter(Boolean).join(" · ");

  return (
    <article className="group">
      <Link href={`/clinics/${clinic.id}`} className="block">
        <HomeBanner
          src={clinic.coverUrl}
          overlay="bottom"
          sizes="(max-width: 768px) 100vw, 96rem"
          imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          className="min-h-[22rem] shadow-soft md:min-h-[30rem]"
        >
          <div className="flex min-h-[22rem] flex-col justify-end gap-2 p-7 text-white md:min-h-[30rem] md:p-11">
            <HomeDisplayTitle
              as="h3"
              className="max-w-[18rem] text-[clamp(2.2rem,4.4vw,3.6rem)] text-white"
            >
              {clinic.name}
            </HomeDisplayTitle>
            {place ? <p className="m-0 text-[1.02rem] text-white/80">{place}</p> : null}
          </div>
        </HomeBanner>
      </Link>
    </article>
  );
}
