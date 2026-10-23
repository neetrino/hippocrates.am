import Image from "next/image";

type PhotoFit = "cover" | "contain";

type PhotoProps = {
  src: string | null;
  alt: string;
  /** Above-the-fold images should load immediately so they can be the LCP element. */
  loading?: "eager" | "lazy";
  sizes?: string;
  /** `contain` shows the whole picture at its own ratio. `cover` fills a fixed frame. */
  fit?: PhotoFit;
};

const containedPhotoClass = "h-auto max-h-[36rem] w-full object-contain";

export function Photo({
  src,
  alt,
  loading,
  sizes = "(max-width: 960px) 100vw, 360px",
  fit = "cover",
}: PhotoProps) {
  if (!src) return <PhotoMark alt={alt} fit={fit} />;
  if (fit === "contain") return <ContainedPhoto src={src} alt={alt} sizes={sizes} loading={loading} />;
  return <CoverPhoto src={src} alt={alt} sizes={sizes} loading={loading} />;
}

function PhotoMark({ alt, fit }: { alt: string; fit: PhotoFit }) {
  return (
    <div
      className={`grid w-full place-items-center bg-linear-to-br from-accent-soft to-sand font-display text-3xl font-semibold text-accent ${fit === "contain" ? "min-h-72" : "h-full"}`}
    >
      {alt.slice(0, 1)}
    </div>
  );
}

function ContainedPhoto({
  src,
  alt,
  sizes,
  loading,
}: {
  src: string;
  alt: string;
  sizes: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <Image
      className={containedPhotoClass}
      style={{ width: "100%", height: "auto", maxHeight: "36rem" }}
      src={src}
      alt={alt}
      width={0}
      height={0}
      sizes={sizes}
      loading={loading}
    />
  );
}

function CoverPhoto({
  src,
  alt,
  sizes,
  loading,
}: {
  src: string;
  alt: string;
  sizes: string;
  loading?: "eager" | "lazy";
}) {
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
