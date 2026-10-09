"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/shared/ui/cn";

const FALLBACK_IMAGE = "/home/hero.jpg";
const SLIDE_MS = 6500;

type HomeHeroSlidesProps = {
  images: string[];
  prevLabel: string;
  nextLabel: string;
};

export function HomeHeroSlides({ images, prevLabel, nextLabel }: HomeHeroSlidesProps) {
  const slides = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [index, setIndex] = useState(0);
  const canNavigate = slides.length > 1;

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!canNavigate) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [canNavigate, slides.length, index]);

  return (
    <>
      <div className="absolute inset-0 -z-10 overflow-hidden bg-linear-to-br from-secondary to-ink" aria-hidden>
        {slides.map((src, slideIndex) => {
          const isActive = slideIndex === index;
          return (
            <div
              key={`${src}-${slideIndex}`}
              className={cn(
                "absolute inset-0 home-hero-slide-fade",
                isActive ? "home-hero-slide-active" : "home-hero-slide-idle",
              )}
            >
              <div
                className={cn(
                  "home-hero-ken-layer",
                  slideIndex % 2 === 0 ? "home-hero-ken-drift" : "home-hero-ken-drift-alt",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  priority={slideIndex === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          );
        })}
        <div className="absolute inset-0 z-1 hidden bg-linear-to-r from-ink/82 via-ink/48 to-ink/18 md:block" />
        <div className="absolute inset-0 z-1 bg-linear-to-t from-ink/88 via-ink/42 to-ink/22 md:hidden" />
      </div>

      {canNavigate ? (
        <div className="pointer-events-none absolute inset-0 z-4 flex items-center justify-between px-2 md:px-6 xl:px-8">
          <button
            type="button"
            aria-label={prevLabel}
            onClick={goPrev}
            className="pointer-events-auto grid size-9 place-items-center rounded-full border border-white/35 bg-white/15 text-white shadow-md backdrop-blur-[6px] transition-[background-color,border-color,transform] duration-160 hover:border-white/50 hover:bg-white/25 active:scale-95 md:size-11"
          >
            <Chevron direction="prev" />
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={goNext}
            className="pointer-events-auto grid size-9 place-items-center rounded-full border border-white/35 bg-white/15 text-white shadow-md backdrop-blur-[6px] transition-[background-color,border-color,transform] duration-160 hover:border-white/50 hover:bg-white/25 active:scale-95 md:size-11"
          >
            <Chevron direction="next" />
          </button>
        </div>
      ) : null}
    </>
  );
}

function Chevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={cn("size-4", direction === "next" && "rotate-180")}
    >
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
