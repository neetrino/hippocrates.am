import styles from "@/shared/ui/rating.module.css";

export function Rating({ value }: { value: number }) {
  const stars = Math.max(0, Math.min(5, Math.round(value)));
  return <span className={styles.stars} aria-label={`${stars} / 5`}>{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span>;
}
