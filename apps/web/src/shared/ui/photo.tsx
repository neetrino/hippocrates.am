import Image from "next/image";

type PhotoProps = {
  src: string | null;
  alt: string;
  rounded?: boolean;
};

export function Photo({ src, alt }: PhotoProps) {
  if (!src) return <div className="photo-fallback">{alt.slice(0, 1)}</div>;
  return <Image className="photo-img" src={src} alt={alt} fill sizes="(max-width: 960px) 100vw, 360px" />;
}
