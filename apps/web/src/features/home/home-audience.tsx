import { HomeBanner, HomeDisplayTitle } from "@/features/home/home-banner";

const banners = ["/home/home-patients.jpg", "/home/home-clinics.jpg"] as const;

export function HomeAudience({
  title,
  items,
}: {
  title: string;
  items: { title: string; body: string }[];
}) {
  return (
    <section className="page-shell grid gap-6 pt-16 max-md:pt-10 md:pt-20">
      <HomeDisplayTitle className="text-[clamp(2.05rem,3.4vw,3rem)]">{title}</HomeDisplayTitle>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item, index) => (
          <AudienceBanner key={item.title} item={item} src={banners[index] ?? banners[0]} />
        ))}
      </div>
    </section>
  );
}

function AudienceBanner({
  item,
  src,
}: {
  item: { title: string; body: string };
  src: string;
}) {
  return (
    <HomeBanner
      src={src}
      overlay="bottom"
      sizes="(max-width: 768px) 100vw, 38rem"
      className="min-h-[28rem] shadow-soft"
    >
      <div className="flex min-h-[28rem] flex-col justify-end gap-3 p-7 text-white md:p-9">
        <HomeDisplayTitle as="h3" className="max-w-[16rem] text-[clamp(2rem,3vw,2.75rem)] text-white">
          {item.title}
        </HomeDisplayTitle>
        <p className="m-0 max-w-[36ch] text-[0.98rem] leading-relaxed text-white/82">{item.body}</p>
      </div>
    </HomeBanner>
  );
}
