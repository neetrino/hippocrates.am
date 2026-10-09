import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/shared/ui/cn";

const overlays = {
  left: "bg-linear-to-r from-ink/86 via-ink/48 to-ink/10",
  bottom: "bg-linear-to-t from-ink/88 via-ink/32 to-ink/5",
  stage: "bg-linear-to-t from-ink/90 via-ink/55 to-ink/28",
} as const;

type HomeBannerProps = {
  src?: string | null;
  children: ReactNode;
  className?: string;
  overlay?: keyof typeof overlays;
  sizes: string;
  imageClassName?: string;
  /** Square corners, for banners that sit flush inside a clipped parent or the viewport. */
  flush?: boolean;
};

/** Photographic panel used by the home sections under the hero. */
export function HomeBanner({
  src,
  children,
  className,
  overlay = "bottom",
  sizes,
  imageClassName,
  flush = false,
}: HomeBannerProps) {
  return (
    <div className={cn("relative overflow-hidden", flush ? "rounded-none" : "rounded-card", className)}>
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-secondary via-ink to-ink" />
      )}
      <div className={cn("absolute inset-0", overlays[overlay])} />
      <div className="relative z-1 h-full">{children}</div>
    </div>
  );
}

export function HomeDisplayTitle({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <Tag
      className={cn(
        "font-catalog leading-[0.96] font-medium tracking-[-0.02em] italic",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
