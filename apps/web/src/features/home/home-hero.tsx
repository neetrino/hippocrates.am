import { HomeClinicSearch } from "@/features/catalog/home-clinic-search";
import { HomeHeroSlides } from "@/features/home/home-hero-slides";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { ClinicCard } from "@/shared/public-types";

type HomeHeroProps = {
  locale: AppLocale;
  title: string;
  lede: string;
  eyebrow: string;
  placeholder: string;
  searchLabel: string;
  emptyLabel: string;
  clinics: ClinicCard[];
  prevSlide: string;
  nextSlide: string;
  images: string[];
};

export function HomeHero({
  locale,
  title,
  lede,
  eyebrow,
  placeholder,
  searchLabel,
  emptyLabel,
  clinics,
  prevSlide,
  nextSlide,
  images,
}: HomeHeroProps) {
  return (
    <section className="relative z-10 -mt-[6.75rem] h-dvh min-h-[32rem] w-full max-md:-mt-[4.75rem]">
      <HomeHeroSlides images={images} prevLabel={prevSlide} nextLabel={nextSlide} />
      <div className="page-shell pointer-events-none relative z-2 flex h-full items-end pt-28 pb-10 md:items-center md:pt-36 md:pb-16">
        <div className="pointer-events-auto grid w-full max-w-[44rem] gap-6 max-md:gap-5">
          <p className="kicker tracking-[0.18em] text-accent">{eyebrow}</p>
          <h1 className="max-w-[18ch] text-[clamp(2.65rem,5.6vw,4.35rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-white max-md:max-w-none">
            {title}
          </h1>
          <p className="m-0 max-w-[28rem] text-[1.12rem] leading-[1.65] font-light text-white/84 max-md:text-[1.02rem]">
            {lede}
          </p>
          <div className="pt-1">
            <HomeClinicSearch
              clinics={clinics}
              action={getPathname({ locale, href: "/clinics" })}
              placeholder={placeholder}
              searchLabel={searchLabel}
              emptyLabel={emptyLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
