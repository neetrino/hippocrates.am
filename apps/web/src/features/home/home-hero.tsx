import { HomeClinicSearch } from "@/features/catalog/home-clinic-search";
import { HomeHeroMobileFill, type HeroMobileClinic, type HeroMobileStep } from "@/features/home/home-hero-mobile";
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
  howTitle: string;
  steps: HeroMobileStep[];
  clinicsLabel: string;
  seeAll: string;
  previewClinics: HeroMobileClinic[];
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
  howTitle,
  steps,
  clinicsLabel,
  seeAll,
  previewClinics,
}: HomeHeroProps) {
  return (
    <section className="relative -mt-[6.75rem] h-dvh min-h-[32rem] w-full overflow-hidden max-md:-mt-[4.75rem] max-md:min-h-[100svh]">
      <HomeHeroSlides images={images} prevLabel={prevSlide} nextLabel={nextSlide}>
        <p className="kicker tracking-[0.18em] text-accent md:text-[0.84rem]">{eyebrow}</p>
        <h1 className="max-w-[16ch] text-[clamp(3.5rem,5.6vw,6rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-white max-md:max-w-[11em] max-md:text-[2.2rem] max-md:leading-[1.15]">
          {title}
        </h1>
        <p className="m-0 max-w-[36rem] text-[1.4rem] leading-[1.55] font-light text-white/84 max-md:max-w-[36ch] max-md:text-[1.02rem] max-md:leading-[1.55]">
          {lede}
        </p>
        <div className="pt-1 max-md:pt-0.5 md:max-w-[42rem]">
          <HomeClinicSearch
            clinics={clinics}
            action={getPathname({ locale, href: "/clinics" })}
            placeholder={placeholder}
            searchLabel={searchLabel}
            emptyLabel={emptyLabel}
          />
        </div>
      </HomeHeroSlides>
      <HomeHeroMobileFill
        howTitle={howTitle}
        steps={steps}
        clinicsLabel={clinicsLabel}
        seeAll={seeAll}
        clinics={previewClinics}
      />
    </section>
  );
}
