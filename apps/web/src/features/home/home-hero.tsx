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
  clinics: ClinicCard[];
};

export function HomeHero({
  locale,
  title,
  lede,
  eyebrow,
  placeholder,
  searchLabel,
  clinics,
}: HomeHeroProps) {
  const featured = clinics.find((clinic) => clinic.coverUrl) ?? clinics[0] ?? null;
  return (
    <section className="relative -mt-[6.75rem] h-dvh min-h-[32rem] w-full overflow-hidden max-md:-mt-[4.75rem]">
      <HeroBackdrop clinic={featured} />
      <div className="page-shell relative z-1 flex h-full items-end pt-28 pb-8 md:items-center md:pt-32 md:pb-12">
        <div className="grid w-full max-w-[38rem] gap-5">
          <p className="kicker">{eyebrow}</p>
          <h1 className="text-white">{title}</h1>
          <p className="m-0 max-w-[32rem] text-[1.06rem] leading-[1.7] font-light text-white/82 max-md:text-base">{lede}</p>
          <SearchBar
            action={getPathname({ locale, href: "/clinics" })}
            placeholder={placeholder}
            ariaLabel={placeholder}
            submitLabel={searchLabel}
          />
        </div>
        {featured ? (
          <Link
            href={`/clinics/${featured.id}`}
            className="absolute right-0 bottom-7 hidden text-[0.82rem] tracking-[0.04em] text-white/70 transition-colors duration-160 hover:text-white md:block"
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
        <Photo src={clinic.coverUrl} alt={clinic.name} loading="eager" sizes="100vw" />
      ) : null}
      <div className="absolute inset-0 hidden bg-linear-to-r from-ink/82 via-ink/48 to-ink/18 md:block" />
      <div className="absolute inset-0 bg-linear-to-t from-ink/88 via-ink/42 to-ink/22 md:hidden" />
    </div>
  );
}
