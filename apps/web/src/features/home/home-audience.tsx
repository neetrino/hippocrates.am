export function HomeAudience({
  title,
  items,
}: {
  title: string;
  items: { title: string; body: string }[];
}) {
  return (
    <section className="grid gap-7 pt-16 max-md:gap-5 max-md:pt-10">
      <h2>{title}</h2>
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {items.map((item) => (
          <article key={item.title} className="grid gap-3 border-t border-line pt-6">
            <h3>{item.title}</h3>
            <p className="m-0 max-w-[36rem] text-[0.98rem] leading-relaxed text-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
