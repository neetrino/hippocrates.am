import Image from "next/image";

type PhotoProps = {
  src: string | null;
  alt: string;
  /** Above-the-fold images should load immediately so they can be the LCP element. */
  loading?: "eager" | "lazy";
  sizes?: string;
};

export function Photo({
  src,
  alt,
  loading,
  sizes = "(max-width: 960px) 100vw, 360px",
}: PhotoProps) {
  if (!src) {
    return (
      <div className="grid h-full w-full place-items-center bg-linear-to-br from-accent-soft to-sand text-2xl font-bold text-accent">
        {alt.slice(0, 1)}
      </div>
    );
  }
  return (
    <Image
      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={loading}
    />
  );
}
