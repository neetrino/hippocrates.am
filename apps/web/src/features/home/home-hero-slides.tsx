"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { cn } from "@/shared/ui/cn";

const FALLBACK_IMAGE = "/home/hero.jpg";
const SLIDE_MS = 6500;

const slideButtonClass =
  "pointer-events-auto grid size-9 place-items-center rounded-full border border-white/40 bg-transparent text-white/70 transition-[background-color,border-color,color,transform] duration-160 hover:border-white/70 hover:bg-white/10 hover:text-white active:scale-95 md:size-11";

type HomeHeroSlidesProps = {
  images: string[];
  prevLabel: string;
  nextLabel: string;
  children: ReactNode;
};

export function HomeHeroSlides({ images, prevLabel, nextLabel, children }: HomeHeroSlidesProps) {
  const slides = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [index, setIndex] = useState(0);
  const canNavigate = slides.length > 1;
  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);
  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);
  useSlideTimer(canNavigate, slides.length, index, setIndex);

  return (
    <>
      <HeroBackdrop slides={slides} index={index} />
      <div className="pointer-events-none relative z-2 flex h-full w-full items-start pt-[6.5rem] pb-8 max-md:mx-auto max-md:w-[min(77.5rem,calc(100%-1.25rem))] md:items-center md:pr-16 md:pl-[5.75rem] md:pt-36 md:pb-16 xl:pl-[7.25rem]">
        <div className="pointer-events-auto grid w-full max-w-[44rem] gap-6 max-md:gap-4 md:max-w-[58rem] md:gap-7">
          {children}
        </div>
      </div>
      {canNavigate ? (
        <SlideNav
          prevLabel={prevLabel}
          nextLabel={nextLabel}
          onPrev={goPrev}
          onNext={goNext}
          className="pointer-events-none z-4 flex items-center justify-between px-3 max-md:relative max-md:mb-3 max-md:h-auto max-md:justify-center max-md:gap-3 md:absolute md:inset-x-0 md:top-0 md:h-dvh md:px-6 xl:px-8"
        />
      ) : null}
    </>
  );
}

function useSlideTimer(
  enabled: boolean,
  count: number,
  index: number,
  setIndex: Dispatch<SetStateAction<number>>,
): void {
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [enabled, count, index, setIndex]);
}

function HeroBackdrop({ slides, index }: { slides: string[]; index: number }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-linear-to-br from-secondary to-ink" aria-hidden>
      {slides.map((src, slideIndex) => (
        <HeroSlide key={`${src}-${slideIndex}`} src={src} slideIndex={slideIndex} active={slideIndex === index} />
      ))}
      <div className="absolute inset-0 z-1 hidden bg-linear-to-r from-ink/82 via-ink/48 to-ink/18 md:block" />
      <div className="absolute inset-0 z-1 bg-linear-to-t from-ink/78 via-ink/62 to-ink/38 md:hidden" />
    </div>
  );
}

function HeroSlide({ src, slideIndex, active }: { src: string; slideIndex: number; active: boolean }) {
  return (
    <div className={cn("absolute inset-0 home-hero-slide-fade", active ? "home-hero-slide-active" : "home-hero-slide-idle")}>
      <div className={cn("home-hero-ken-layer", slideIndex % 2 === 0 ? "home-hero-ken-drift" : "home-hero-ken-drift-alt")}>
        <Image src={src} alt="" fill priority={slideIndex === 0} sizes="100vw" className="object-cover object-center" />
      </div>
    </div>
  );
}

function SlideNav({
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
  className,
}: {
  prevLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  className: string;
}) {
  return (
    <div className={className}>
      <button type="button" aria-label={prevLabel} onClick={onPrev} className={slideButtonClass}>
        <Chevron direction="prev" />
      </button>
      <button type="button" aria-label={nextLabel} onClick={onNext} className={slideButtonClass}>
        <Chevron direction="next" />
      </button>
    </div>
  );
}

function Chevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={cn("size-4", direction === "next" && "rotate-180")}>
      <path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
