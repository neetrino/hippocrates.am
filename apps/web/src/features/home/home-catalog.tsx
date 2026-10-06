import { Link } from "@/i18n/navigation";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";
import { SectionHeader } from "@/shared/ui/section-header";

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
    <section className="grid gap-6 pt-16 max-md:gap-4 max-md:pt-10">
      <SectionHeader
        title={clinicsTitle}
        action={
          <Link href="/clinics" className="btn btn-ghost shrink-0">
            {seeAll}
          </Link>
        }
      />
      {clinics.length === 0 ? <EmptyState>{emptyClinics}</EmptyState> : null}
      <div className="grid gap-4 max-md:gap-3 md:grid-cols-3">
        {clinics.map((clinic, index) => (
          <ClinicTile key={clinic.id} clinic={clinic} loading={index === 0 ? "eager" : undefined} />
        ))}
      </div>
    </section>
  );
}
