import { getLocale, getTranslations } from "next-intl/server";
import { ClinicReviewList, type ClinicReview } from "@/features/clinic/clinic-review-list";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { formatWhen } from "@/shared/format";
import { sessionGet } from "@/shared/session-api";

export default async function ClinicReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const meLabel = await getTranslations("me");
  const common = await getTranslations("common");
  const me = await requireClinicAdmin();
  const reviews = ((await sessionGet<Omit<ClinicReview, "when">[]>(`/clinics/${me.clinicId}/reviews`)) ?? []).map((review) => ({
    ...review,
    when: formatWhen(review.createdAt, locale),
  }));

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={meLabel("reviews")}>
      <ClinicReviewList reviews={reviews} />
    </ClinicManagerShell>
  );
}
