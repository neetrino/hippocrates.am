export function HomeHow({
  title,
  steps,
}: {
  title: string;
  steps: { title: string; body: string }[];
}) {
  return (
    <section className="grid gap-7 pt-16 max-md:gap-5 max-md:pt-10">
      <h2>{title}</h2>
      <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
        {steps.map((step, index) => (
          <li key={step.title} className="grid gap-3">
            <span className="font-display text-[1.35rem] text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{step.title}</h3>
            <p className="m-0 max-w-[28ch] text-[0.98rem] leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
