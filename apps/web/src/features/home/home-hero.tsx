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
  return (
    <section className="grid items-center gap-10 py-12 max-md:gap-8 max-md:py-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="grid max-w-[38rem] gap-5">
        <p className="kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="m-0 max-w-[34rem] text-[1.08rem] leading-[1.7] font-light text-muted max-md:text-base">{lede}</p>
        <SearchBar
          action={getPathname({ locale, href: "/clinics" })}
          placeholder={placeholder}
          ariaLabel={placeholder}
          submitLabel={searchLabel}
        />
        <Link href="/doctors" className="btn btn-ghost w-fit px-0">
          {doctorsLabel}
        </Link>
      </div>
      <HeroGallery clinics={clinics} />
    </section>
  );
}

function HeroGallery({ clinics }: { clinics: ClinicCard[] }) {
  const featured = clinics.slice(0, 3);
  const first = featured[0];
  if (!first) {
    return <div className="min-h-[22rem] rounded-card bg-linear-to-br from-accent-soft via-sand to-surface-muted max-md:min-h-[16rem]" />;
  }
  const rest = featured.slice(1);
  return (
    <div className="grid gap-3 max-md:grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] md:min-h-[26rem]">
      <HeroShot clinic={first} eager className="min-h-[22rem] max-md:min-h-[16rem]" />
      {rest.length > 0 ? (
        <div className="grid gap-3 max-md:hidden">
          {rest.map((clinic) => (
            <HeroShot key={clinic.id} clinic={clinic} className="min-h-[12.4rem]" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HeroShot({
  clinic,
  className,
  eager,
}: {
  clinic: ClinicCard;
  className?: string;
  eager?: boolean;
}) {
  return (
    <Link href={`/clinics/${clinic.id}`} className={`group relative overflow-hidden rounded-card bg-sand ${className ?? ""}`}>
      <Photo src={clinic.coverUrl} alt={clinic.name} loading={eager ? "eager" : "lazy"} sizes="(max-width: 768px) 100vw, 50vw" />
      <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/70 to-transparent px-4 py-3 font-display text-[1.02rem] text-white">
        {clinic.name}
      </span>
    </Link>
  );
}
