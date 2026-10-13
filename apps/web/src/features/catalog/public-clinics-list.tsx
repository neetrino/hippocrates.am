import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

type PublicClinicsListProps = {
  clinics: ClinicCard[];
  emptyLabel: string;
  savedClinicIds: string[] | null;
};

export function PublicClinicsList({ clinics, emptyLabel, savedClinicIds }: PublicClinicsListProps) {
  return (
    <>
      {clinics.length === 0 ? <EmptyState>{emptyLabel}</EmptyState> : null}
      <div className="grid gap-4 max-md:gap-3 md:grid-cols-3">
        {clinics.map((clinic, index) => (
          <ClinicTile
            key={clinic.id}
            clinic={clinic}
            loading={index === 0 ? "eager" : undefined}
            saved={savedClinicIds === null ? undefined : savedClinicIds.includes(clinic.id)}
          />
        ))}
      </div>
    </>
  );
}
