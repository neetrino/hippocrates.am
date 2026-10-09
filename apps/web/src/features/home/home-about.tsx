export function HomeAbout({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="grid gap-8 pt-16 max-md:gap-5 max-md:pt-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start">
      <div className="grid gap-3">
        <p className="kicker">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <p className="m-0 max-w-[40rem] text-[1.05rem] leading-[1.75] text-muted">{body}</p>
    </section>
  );
}
