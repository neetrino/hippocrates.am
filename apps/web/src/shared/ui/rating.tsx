export function Rating({ value }: { value: number }) {
  const stars = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="font-sans text-[0.92rem] tracking-[0.12em] text-waiting-ink" aria-label={`${stars} / 5`}>
      {"★".repeat(stars)}
      <span className="text-line">{"☆".repeat(5 - stars)}</span>
    </span>
  );
}
