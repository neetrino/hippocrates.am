export function HomeTrust({
  items,
}: {
  items: { title: string; body: string }[];
}) {
  return (
    <section className="grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className="grid gap-2 bg-surface px-6 py-6">
          <p className="m-0 font-display text-[1.05rem] font-semibold text-ink">{item.title}</p>
          <p className="m-0 text-[0.94rem] leading-relaxed text-muted">{item.body}</p>
        </article>
      ))}
    </section>
  );
}
