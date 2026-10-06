import Image from "next/image";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { SearchBar } from "@/shared/ui/search-bar";

const HERO_IMAGE = "/home/hero.jpg";

type HomeHeroProps = {
  locale: AppLocale;
  title: string;
  lede: string;
  eyebrow: string;
  placeholder: string;
  searchLabel: string;
};

export function HomeHero({ locale, title, lede, eyebrow, placeholder, searchLabel }: HomeHeroProps) {
  return (
    <section className="relative -mt-[6.75rem] h-dvh min-h-[32rem] w-full overflow-hidden max-md:-mt-[4.75rem]">
      <HeroBackdrop />
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
      </div>
    </section>
  );
}

function HeroBackdrop() {
  return (
    <div className="absolute inset-0 bg-linear-to-br from-secondary to-ink" aria-hidden>
      <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 hidden bg-linear-to-r from-ink/82 via-ink/48 to-ink/18 md:block" />
      <div className="absolute inset-0 bg-linear-to-t from-ink/88 via-ink/42 to-ink/22 md:hidden" />
    </div>
  );
}
