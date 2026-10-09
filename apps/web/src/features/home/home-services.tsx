export function HomeServices({
  title,
  items,
}: {
  title: string;
  items: { title: string; body: string }[];
}) {
  return (
    <section className="grid gap-7 pt-16 max-md:gap-5 max-md:pt-10">
      <h2>{title}</h2>
      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <li key={item.title} className="grid gap-3">
            <span className="font-display text-[1.2rem] text-accent">{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p className="m-0 text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
