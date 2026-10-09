import { HomeBanner, HomeDisplayTitle } from "@/features/home/home-banner";

export function HomeServices({
  title,
  items,
}: {
  title: string;
  items: { title: string; body: string }[];
}) {
  return (
    <section className="page-shell pt-16 max-md:pt-10 md:pt-20">
      <HomeBanner
        src="/home/home-services.jpg"
        overlay="left"
        sizes="(max-width: 1200px) 100vw, 78rem"
        className="min-h-[18rem] shadow-soft md:min-h-[22rem]"
      >
        <div className="flex min-h-[18rem] items-start p-7 md:min-h-[22rem] md:p-12">
          <HomeDisplayTitle className="max-w-[18rem] text-[clamp(2.15rem,4vw,3.35rem)] text-white">
            {title}
          </HomeDisplayTitle>
        </div>
      </HomeBanner>
      <ol className="relative z-1 -mt-8 grid gap-4 px-3 sm:grid-cols-2 md:-mt-14 md:px-8 lg:grid-cols-4">
        {items.map((item, index) => (
          <li key={item.title} className="grid gap-3 rounded-card bg-surface px-5 py-5 shadow-soft">
            <span className="font-catalog text-[1.7rem] leading-none font-medium text-accent italic">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{item.title}</h3>
            <p className="m-0 text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
