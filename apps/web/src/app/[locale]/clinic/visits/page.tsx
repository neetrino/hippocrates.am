import { getLocale, getTranslations } from "next-intl/server";
import { ClinicVisitBoard } from "@/features/clinic/clinic-visit-board";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { formatWhen } from "@/shared/format";
import type { AppointmentCard } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function ClinicVisitsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const meLabel = await getTranslations("me");
  const common = await getTranslations("common");
  await requireClinicAdmin();
  const appointments = (await sessionGet<AppointmentCard[]>("/appointments/mine")) ?? [];

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={meLabel("visits")}>
      <ClinicVisitBoard visits={deskVisits(appointments).map((item) => ({ ...item, when: formatWhen(item.startsAt, locale) }))} />
    </ClinicManagerShell>
  );
}

function deskVisits(items: AppointmentCard[]): AppointmentCard[] {
  const now = Date.now();
  const rank = (item: AppointmentCard): number => {
    const started = Date.parse(item.startsAt) <= now;
    if (item.status === "CONFIRMED" && started) return 0;
    if (item.status === "REQUESTED" || item.status === "CONFIRMED") return 1;
    return 2;
  };
  return [...items].sort((left, right) => rank(left) - rank(right) || left.startsAt.localeCompare(right.startsAt));
}
