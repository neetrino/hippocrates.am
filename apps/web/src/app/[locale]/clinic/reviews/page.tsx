import { getLocale, getTranslations } from "next-intl/server";
import { ClinicReviewList, type ClinicReview } from "@/features/clinic/clinic-review-list";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { formatWhen } from "@/shared/format";
import { sessionGet } from "@/shared/session-api";
import { ListPagination, listPage } from "@/shared/ui/list-pagination";

export default async function ClinicReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const meLabel = await getTranslations("me");
  const common = await getTranslations("common");
  const page = listPage((await searchParams).page);
  const me = await requireClinicAdmin();
  const suffix = page > 1 ? `?page=${page}` : "";
  const reviews = ((await sessionGet<Omit<ClinicReview, "when">[]>(`/clinics/${me.clinicId}/reviews${suffix}`)) ?? []).map((review) => ({
    ...review,
    when: formatWhen(review.createdAt, locale),
  }));

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={meLabel("reviews")}>
      <ClinicReviewList reviews={reviews} />
      <ListPagination page={page} itemCount={reviews.length} />
    </ClinicManagerShell>
  );
}
