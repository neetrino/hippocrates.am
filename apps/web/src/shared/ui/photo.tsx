import Image from "next/image";
import styles from "@/shared/ui/photo.module.css";

type PhotoProps = {
  src: string | null;
  alt: string;
  /** Above-the-fold images should load immediately so they can be the LCP element. */
  loading?: "eager" | "lazy";
};

export function Photo({ src, alt, loading }: PhotoProps) {
  if (!src) return <div className={styles.fallback}>{alt.slice(0, 1)}</div>;
  return (
    <Image
      className={styles.img}
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 960px) 100vw, 360px"
      loading={loading}
    />
  );
}
