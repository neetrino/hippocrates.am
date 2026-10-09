import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { HomeHeroSlides } from "@/features/home/home-hero-slides";
import { SearchBar } from "@/shared/ui/search-bar";

type HomeHeroProps = {
  locale: AppLocale;
  title: string;
  lede: string;
  eyebrow: string;
  placeholder: string;
  searchLabel: string;
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
  prevSlide,
  nextSlide,
  images,
}: HomeHeroProps) {
  return (
    <section className="relative -mt-[6.75rem] h-dvh min-h-[32rem] w-full overflow-hidden max-md:-mt-[4.75rem] max-md:min-h-[100svh]">
      <HomeHeroSlides images={images} prevLabel={prevSlide} nextLabel={nextSlide}>
        <p className="kicker tracking-[0.18em] text-accent">{eyebrow}</p>
        <h1 className="max-w-[18ch] text-[clamp(2.65rem,5.6vw,4.35rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-white max-md:max-w-[11em] max-md:text-[2.2rem] max-md:leading-[1.15]">
          {title}
        </h1>
        <p className="m-0 max-w-[28rem] text-[1.12rem] leading-[1.65] font-light text-white/84 max-md:max-w-[36ch] max-md:text-[1.02rem] max-md:leading-[1.55]">
          {lede}
        </p>
        <div className="pt-1 max-md:pt-0.5">
          <SearchBar
            action={getPathname({ locale, href: "/clinics" })}
            placeholder={placeholder}
            ariaLabel={placeholder}
            submitLabel={searchLabel}
          />
        </div>
      </HomeHeroSlides>
    </section>
  );
}
