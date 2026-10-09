import { cn } from "@/shared/ui/cn";

export function HomeTrust({
  items,
  className,
}: {
  items: { title: string; body: string }[];
  className?: string;
}) {
  return (
    <section className={cn("mt-16 grid gap-px overflow-hidden rounded-card border border-line bg-line max-md:mt-10 md:grid-cols-3", className)}>
      {items.map((item) => (
        <article key={item.title} className="grid gap-2 bg-surface px-6 py-6">
          <p className="m-0 font-display text-[1.05rem] font-semibold text-ink">{item.title}</p>
          <p className="m-0 text-[0.94rem] leading-relaxed text-muted">{item.body}</p>
        </article>
      ))}
    </section>
  );
}
