import { Link } from "@/i18n/navigation";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

export function HomeCatalog({
  clinicsTitle,
  seeAll,
  emptyClinics,
  clinics,
}: {
  clinicsTitle: string;
  seeAll: string;
  emptyClinics: string;
  clinics: ClinicCard[];
}) {
  return (
    <section className="page-shell-wide grid gap-6 pt-10 pb-2 max-md:gap-4 max-md:pt-7">
      <div className="relative flex min-h-16 items-center justify-center">
        <h2 className="text-center text-[clamp(2.8rem,4.4vw,3.7rem)] leading-none tracking-[-0.035em]">
          {clinicsTitle}
        </h2>
        <Link href="/clinics" className="btn btn-ghost absolute right-0 shrink-0">
          {seeAll}
        </Link>
      </div>
      {clinics.length === 0 ? <EmptyState>{emptyClinics}</EmptyState> : null}
      <div className="grid gap-6 max-md:gap-4 md:grid-cols-2">
        {clinics.map((clinic, index) => (
          <ClinicTile key={clinic.id} clinic={clinic} size="large" loading={index === 0 ? "eager" : undefined} />
        ))}
      </div>
    </section>
  );
}
