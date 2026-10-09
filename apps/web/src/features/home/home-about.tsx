import Image from "next/image";
import { HomeDisplayTitle } from "@/features/home/home-banner";

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
    <section className="page-shell mt-16 overflow-hidden rounded-card bg-surface shadow-soft max-md:mt-10 md:mt-20 md:grid md:grid-cols-2">
      <div className="relative min-h-72 md:min-h-[34rem]">
        <Image
          src="/home/home-about.jpg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 40rem"
          className="object-cover"
        />
      </div>
      <div className="grid content-center gap-5 px-6 py-10 md:px-12 md:py-14">
        <p className="kicker">{eyebrow}</p>
        <HomeDisplayTitle className="text-[clamp(2.05rem,3.4vw,3.05rem)]">{title}</HomeDisplayTitle>
        <p className="m-0 text-[1.05rem] leading-[1.75] text-muted">{body}</p>
      </div>
    </section>
  );
}
