import Image from "next/image";

type PhotoFocus = "center" | "face";

type PhotoProps = {
  src: string | null;
  alt: string;
  /** Above-the-fold images should load immediately so they can be the LCP element. */
  loading?: "eager" | "lazy";
  sizes?: string;
  /** `face` anchors a portrait crop at the top. Catalog cards stay centered. */
  focus?: PhotoFocus;
};

const focusClass: Record<PhotoFocus, string> = {
  center: "",
  face: "object-top",
};

export function Photo({
  src,
  alt,
  loading,
  sizes = "(max-width: 960px) 100vw, 360px",
  focus = "center",
}: PhotoProps) {
  if (!src) {
    return (
      <div className="grid h-full w-full place-items-center bg-linear-to-br from-accent-soft to-sand font-display text-3xl font-semibold text-accent">
        {alt.slice(0, 1)}
      </div>
    );
  }
  return (
    <Image
      className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${focusClass[focus]}`}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={loading}
    />
  );
}
