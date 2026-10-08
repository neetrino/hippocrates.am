import { getTranslations } from "next-intl/server";
import { ClinicServiceForm } from "@/features/clinic/clinic-forms";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { formatAmount } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";
import { sessionGet } from "@/shared/session-api";

type StaffDoctor = { id: string; user: { displayName: string } };
type Offering = {
  id: string;
  name: string;
  priceAmd: number;
  durationMinutes: number;
  isEstimate: boolean;
  doctor: { user: { displayName: string } };
};

export default async function ClinicServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const services = await getTranslations("services");
  const me = await requireClinicAdmin();
  const [doctors, offerings] = await Promise.all([
    sessionGet<StaffDoctor[]>(`/clinics/${me.clinicId}/doctors`),
    sessionGet<Offering[]>(`/clinics/${me.clinicId}/offerings`),
  ]);

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={portal("services")}>
      <div className="grid gap-8">
        <div className="grid gap-3">
          {(offerings ?? []).map((item) => (
            <p className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5" key={item.id}>
              <span>
                <span className="font-semibold">{localizedServiceName(item.name, services)}</span>
                <span className="mt-1 block text-sm text-muted">{item.doctor.user.displayName}</span>
              </span>
              <span>
                {common("price", { amount: formatAmount(item.priceAmd) })} · {common("minutes", { count: item.durationMinutes })}
                {item.isEstimate ? ` · ${common("estimate")}` : ""}
              </span>
            </p>
          ))}
        </div>
        <ClinicServiceForm
          clinicId={me.clinicId}
          doctors={(doctors ?? []).map((doctor) => ({ id: doctor.id, name: doctor.user.displayName }))}
        />
      </div>
    </ClinicManagerShell>
  );
}
