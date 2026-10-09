import { Link } from "@/i18n/navigation";

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
    <section className="mt-16 grid gap-5 rounded-card bg-secondary px-8 py-10 text-white max-md:mt-10 max-md:px-5 max-md:py-8">
      <h2 className="text-white">{title}</h2>
      <p className="m-0 max-w-[36rem] text-[1.02rem] leading-relaxed text-white/75">{body}</p>
      <div className="flex flex-wrap gap-3 pt-1">
        <Link href="/clinics" className="btn btn-primary">
          {clinicsLabel}
        </Link>
        <Link href="/doctors" className="btn border-0 bg-white/10 text-white hover:bg-white/16">
          {doctorsLabel}
        </Link>
      </div>
    </section>
  );
}
