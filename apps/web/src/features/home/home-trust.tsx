import Image from "next/image";
import { cn } from "@/shared/ui/cn";

export function HomeTrust({
  items,
  className,
}: {
  items: { title: string; body: string }[];
  className?: string;
}) {
  return (
    <section className={cn("relative mt-16 overflow-hidden bg-ink text-white max-md:mt-10", className)}>
      <Image
        src="/home/home-clinics.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-ink/62" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_280px_at_8%_0%,rgba(0,167,157,0.28),transparent_60%)]" />
      <div className="page-shell relative z-1 grid gap-0 py-14 md:grid-cols-3 md:py-20">
        {items.map((item, index) => (
          <TrustColumn key={item.title} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

function TrustColumn({
  item,
  index,
}: {
  item: { title: string; body: string };
  index: number;
}) {
  return (
    <article
      className={cn(
        "grid gap-3",
        index > 0 && "border-t border-white/14 pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-8",
        index < 2 && "md:pr-8",
      )}
    >
      <span className="font-catalog text-[2.5rem] leading-none font-medium text-accent italic">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="text-[1.2rem] text-white">{item.title}</h3>
      <p className="m-0 max-w-[32ch] text-[0.98rem] leading-relaxed text-white/74">{item.body}</p>
    </article>
  );
}
