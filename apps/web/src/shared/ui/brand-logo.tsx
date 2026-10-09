import Image from "next/image";
import { cn } from "@/shared/ui/cn";

type BrandLogoSize = "header" | "menu" | "auth";

type BrandLogoProps = {
  size?: BrandLogoSize;
  priority?: boolean;
};

const markClass: Record<BrandLogoSize, string> = {
  header:
    "h-[42px] w-auto max-w-none object-contain transition-[height] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-[.is-scrolled]:h-[34px] max-md:h-[30px] max-md:group-[.is-scrolled]:h-[26px]",
  menu: "h-8 w-auto max-w-none object-contain",
  auth: "h-10 w-auto max-w-none object-contain max-sm:h-9",
};

const wordClass: Record<BrandLogoSize, string> = {
  header:
    "text-[13px] group-[.is-scrolled]:text-[11px] max-md:text-[11px] max-md:group-[.is-scrolled]:text-[10px]",
  menu: "text-[12px]",
  auth: "text-[14px] max-sm:text-[13px]",
};

/** Stacked mark and word. The word is text so the letters stay complete. */
export function BrandLogo({ size = "header", priority = false }: BrandLogoProps) {
  return (
    <span className="inline-flex shrink-0 flex-col items-center gap-0.5 leading-none">
      <Image
        src="/brand/hippocrates-mark.png"
        alt=""
        width={376}
        height={470}
        className={markClass[size]}
        priority={priority}
      />
      <span className={cn("font-sans font-bold leading-[1.35] tracking-[-0.04em] text-accent", wordClass[size])}>
        hippocrates
      </span>
    </span>
  );
}
