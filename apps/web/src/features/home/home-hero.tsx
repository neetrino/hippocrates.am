import { getPathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { ClinicCard } from "@/shared/public-types";
import { Photo } from "@/shared/ui/photo";
import { SearchBar } from "@/shared/ui/search-bar";

type HomeHeroProps = {
  locale: AppLocale;
  title: string;
  lede: string;
  eyebrow: string;
  placeholder: string;
  searchLabel: string;
  doctorsLabel: string;
  clinics: ClinicCard[];
};

export function HomeHero({
  locale,
  title,
  lede,
  eyebrow,
  placeholder,
  searchLabel,
  doctorsLabel,
  clinics,
}: HomeHeroProps) {
  const featured = clinics.find((clinic) => clinic.coverUrl) ?? clinics[0] ?? null;
  return (
    <section className="relative mt-3 mb-8 overflow-hidden rounded-card max-md:mt-1 max-md:mb-6">
      <HeroBackdrop clinic={featured} />
      <div className="relative z-1 grid min-h-[28rem] content-end gap-6 px-6 py-8 max-md:min-h-[32rem] md:min-h-[32rem] md:content-center md:px-12 md:py-14">
        <div className="grid max-w-[36rem] gap-5">
          <p className="kicker">{eyebrow}</p>
          <h1 className="text-white">{title}</h1>
          <p className="m-0 max-w-[32rem] text-[1.06rem] leading-[1.7] font-light text-white/82 max-md:text-base">{lede}</p>
          <SearchBar
            action={getPathname({ locale, href: "/clinics" })}
            placeholder={placeholder}
            ariaLabel={placeholder}
            submitLabel={searchLabel}
          />
          <Link href="/doctors" className="btn btn-ghost w-fit px-0 text-white hover:text-white/80">
            {doctorsLabel}
          </Link>
        </div>
        {featured ? (
          <Link
            href={`/clinics/${featured.id}`}
            className="justify-self-start text-[0.82rem] tracking-[0.04em] text-white/70 transition-colors duration-160 hover:text-white md:absolute md:right-8 md:bottom-7 md:justify-self-auto"
          >
            {featured.name}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function HeroBackdrop({ clinic }: { clinic: ClinicCard | null }) {
  return (
    <div className="absolute inset-0 bg-linear-to-br from-secondary to-ink">
      {clinic ? (
        <Photo
          src={clinic.coverUrl}
          alt={clinic.name}
          loading="eager"
          sizes="(max-width: 960px) 100vw, 1240px"
        />
      ) : null}
      <div className="absolute inset-0 hidden bg-linear-to-r from-ink/82 via-ink/48 to-ink/18 md:block" />
      <div className="absolute inset-0 bg-linear-to-t from-ink/88 via-ink/42 to-ink/22 md:hidden" />
    </div>
  );
}
