import { Link } from "@/i18n/navigation";
import { HomeBanner, HomeDisplayTitle } from "@/features/home/home-banner";

export function HomeCta({
  title,
  body,
  clinicsLabel,
  doctorsLabel,
}: {
  title: string;
  body: string;
  clinicsLabel: string;
  doctorsLabel: string;
}) {
  return (
    <section className="relative mt-16 overflow-hidden max-md:mt-10">
      <HomeBanner
        src="/home/home-cta.jpg"
        overlay="left"
        sizes="100vw"
        flush
        className="min-h-[26rem]"
      >
        <div className="page-shell flex min-h-[26rem] max-w-none flex-col justify-center py-14 md:py-20">
          <div className="grid max-w-[34rem] gap-5 text-white">
            <HomeDisplayTitle className="text-[clamp(2.3rem,4.2vw,3.6rem)] text-white">
              {title}
            </HomeDisplayTitle>
            <p className="m-0 text-[1.05rem] leading-relaxed text-white/78">{body}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/clinics" className="btn btn-primary">
                {clinicsLabel}
              </Link>
              <Link
                href="/doctors"
                className="btn border-0 bg-white/12 text-white ring-1 ring-white/20 backdrop-blur-md hover:bg-white/20"
              >
                {doctorsLabel}
              </Link>
            </div>
          </div>
        </div>
      </HomeBanner>
    </section>
  );
}
