import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatAmount } from "@/shared/format";

export type ClinicPatient = { id: string; displayName: string; email: string; phone: string | null };
export type FinanceTotals = { REQUESTED: number; CONFIRMED: number; COMPLETED: number };

const row = "flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5";

export async function ClinicFinance({ totals }: { totals: FinanceTotals }) {
  const common = await getTranslations("common");
  const amounts = [
    ["REQUESTED", totals.REQUESTED],
    ["CONFIRMED", totals.CONFIRMED],
    ["COMPLETED", totals.COMPLETED],
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {amounts.map(([status, amount]) => (
        <article className={row} key={status}>
          <span className="text-muted">{common(status)}</span>
          <strong>{common("price", { amount: formatAmount(amount) })}</strong>
        </article>
      ))}
    </div>
  );
}

export async function ClinicPatientList({ patients }: { patients: ClinicPatient[] }) {
  const t = await getTranslations("desk");
  if (patients.length === 0) {
    return <p className="m-0 rounded-[14px] border border-line bg-white px-4 py-5 text-muted">{t("noPatients")}</p>;
  }
  return (
    <div className="grid gap-3">
      {patients.map((patient) => (
        <Link className={`${row} transition-shadow duration-160 hover:shadow-accent`} href={`/clinic/patients/${patient.id}`} key={patient.id}>
          <span className="font-semibold">{patient.displayName}</span>
          <span className="text-sm text-muted">{patient.phone ?? patient.email}</span>
        </Link>
      ))}
    </div>
  );
}
