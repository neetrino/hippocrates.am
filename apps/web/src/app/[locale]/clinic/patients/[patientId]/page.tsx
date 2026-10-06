import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { asVisitStatus, formatAmount, formatWhen } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

type PatientCard = {
  patient: { id: string; displayName: string; email: string; phone: string | null } | null;
  appointments: { id: string; startsAt: string; status: string; priceAmd: number; isEstimate: boolean; offering: { name: string } }[];
};

export default async function ClinicPatientPage({ params }: { params: Promise<{ locale: string; patientId: string }> }) {
  const { locale: raw, patientId } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const t = await getTranslations("desk");
  const common = await getTranslations("common");
  const services = await getTranslations("services");
  const me = await sessionGet<Me>("/auth/me");
  if (!me || me.role !== "ADMIN" || !me.clinicId) {
    return <DeskNote>{t("denied")}</DeskNote>;
  }
  const card = await sessionGet<PatientCard>(`/clinics/${me.clinicId}/patients/${patientId}`);
  if (!card?.patient) return <DeskNote>{t("patientMissing")}</DeskNote>;

  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-4 pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      <Link href="/clinic" className="w-fit text-sm font-semibold text-accent">
        {t("backDesk")}
      </Link>
      <h1>{card.patient.displayName}</h1>
      <p className="m-0 text-muted">
        {card.patient.email}
        {card.patient.phone ? ` · ${card.patient.phone}` : ""}
      </p>
      <section className="grid gap-3">
        <h2>{t("visits")}</h2>
        {card.appointments.map((item) => {
          const status = asVisitStatus(item.status);
          const price = common("price", { amount: formatAmount(item.priceAmd) });
          return (
            <article className="rounded-[14px] border border-line bg-white px-4 py-3.5" key={item.id}>
              <strong>{localizedServiceName(item.offering.name, services)}</strong>
              <p className="m-0 text-muted">
                {formatWhen(item.startsAt, locale)} · {status ? common(status) : item.status} · {price}
                {item.isEstimate ? ` · ${common("estimate")}` : ""}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function DeskNote({ children }: { children: string }) {
  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      <p>{children}</p>
    </div>
  );
}
