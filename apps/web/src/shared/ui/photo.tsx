import Image from "next/image";

type PhotoProps = {
  src: string | null;
  alt: string;
  /** Above-the-fold images should load immediately so they can be the LCP element. */
  loading?: "eager" | "lazy";
};

export function Photo({ src, alt, loading }: PhotoProps) {
  if (!src) {
    return (
      <div className="grid h-full w-full place-items-center bg-linear-to-br from-accent-soft to-sand text-2xl font-bold text-accent">
        {alt.slice(0, 1)}
      </div>
    );
  }
  return (
    <Image
      className="object-cover"
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 960px) 100vw, 360px"
      loading={loading}
    />
  );
}
