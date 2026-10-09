import { Link } from "@/i18n/navigation";

export type HeroMobileStep = { title: string; body: string };
export type HeroMobileClinic = { id: string; name: string; district: string };

type HomeHeroMobileFillProps = {
  howTitle: string;
  steps: HeroMobileStep[];
  clinicsLabel: string;
  seeAll: string;
  clinics: HeroMobileClinic[];
};

export function HomeHeroMobileFill({ howTitle, steps, clinicsLabel, seeAll, clinics }: HomeHeroMobileFillProps) {
  const preview = clinics.slice(0, 2);

  return (
    <div className="relative z-3 mx-3 mb-5 hidden flex-col gap-3 [@media(max-width:768px)_and_(min-height:740px)]:flex">
      <p className="kicker leading-normal tracking-[0.14em] text-white/80">{howTitle}</p>
      <ol className="grid gap-2.5">
        {steps.map((step, index) => (
          <StepRow key={step.title} index={index} step={step} />
        ))}
      </ol>
      {preview.length > 0 ? (
        <ClinicPeek label={clinicsLabel} seeAll={seeAll} clinics={preview} />
      ) : null}
    </div>
  );
}

function StepRow({ index, step }: { index: number; step: HeroMobileStep }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-white/25 bg-ink/40 px-3.5 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-[0.8rem] font-semibold text-white">
        {index + 1}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.95rem] leading-snug font-semibold text-white">{step.title}</span>
        <span className="mt-1 block text-[0.8rem] leading-relaxed text-white/75">{step.body}</span>
      </span>
    </li>
  );
}

function ClinicPeek({
  label,
  seeAll,
  clinics,
}: {
  label: string;
  seeAll: string;
  clinics: HeroMobileClinic[];
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between px-0.5">
        <p className="m-0 text-[0.72rem] font-semibold tracking-[0.14em] text-white/75 uppercase">{label}</p>
        <Link href="/clinics" className="text-[0.78rem] font-medium text-white underline-offset-2 hover:underline">
          {seeAll}
        </Link>
      </div>
      <div className="grid gap-2">
        {clinics.map((clinic) => (
          <Link
            key={clinic.id}
            href={`/clinics/${clinic.id}`}
            className="grid min-w-0 gap-0.5 rounded-2xl bg-surface px-3.5 py-2.5 shadow-soft"
          >
            <span className="truncate text-[0.92rem] font-semibold text-ink">{clinic.name}</span>
            <span className="truncate text-[0.78rem] text-muted">{clinic.district}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
