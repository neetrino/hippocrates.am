import { HomeBanner, HomeDisplayTitle } from "@/features/home/home-banner";

export function HomeHow({
  title,
  steps,
}: {
  title: string;
  steps: { title: string; body: string }[];
}) {
  return (
    <section className="page-shell pt-16 max-md:pt-10 md:pt-20">
      <HomeBanner
        src="/home/home-how.jpg"
        overlay="stage"
        sizes="(max-width: 1200px) 100vw, 78rem"
        className="shadow-soft"
      >
        <div className="grid min-h-[32rem] content-between gap-8 p-7 md:min-h-[34rem] md:p-12">
          <HomeDisplayTitle className="max-w-[16rem] text-[clamp(2.15rem,4vw,3.35rem)] text-white">
            {title}
          </HomeDisplayTitle>
          <ol className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-2 rounded-card bg-white/12 px-5 py-5 text-white ring-1 ring-white/18 backdrop-blur-md"
              >
                <span className="font-catalog text-[1.65rem] leading-none font-medium text-accent italic">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-white">{step.title}</h3>
                <p className="m-0 text-[0.95rem] leading-relaxed text-white/80">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </HomeBanner>
    </section>
  );
}
