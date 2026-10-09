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
    <section className="relative -mt-[6.75rem] h-dvh min-h-[32rem] w-full overflow-hidden max-md:-mt-[4.75rem]">
      <HomeHeroSlides images={images} prevLabel={prevSlide} nextLabel={nextSlide} />
      <div className="page-shell pointer-events-none relative z-2 flex h-full items-end pt-28 pb-8 md:items-center md:pt-32 md:pb-12">
        <div className="pointer-events-auto grid w-full max-w-[38rem] gap-5">
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
      </div>
    </section>
  );
}
