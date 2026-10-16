import { getTranslations } from "next-intl/server";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { VerificationBoard } from "@/features/portal/verification-board";
import type { VerificationQueue } from "@/features/portal/verification-status";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";
import { ListPagination, listPage } from "@/shared/ui/list-pagination";

const emptyQueue: VerificationQueue = { clinics: [], doctors: [] };

export default async function VerificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  prepareLocale(locale);
  await requireSuperAdmin();
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const page = listPage((await searchParams).page);
  const queue = (
    (await sessionGet<VerificationQueue>(`/admin/verification${page > 1 ? `?page=${page}` : ""}`)) ?? emptyQueue
  );

  return (
    <AdminPortalShell eyebrow={common("SUPER_ADMIN")} title={portal("verification")}>
      <VerificationBoard queue={queue} />
      <ListPagination page={page} itemCount={Math.max(queue.clinics.length, queue.doctors.length)} />
    </AdminPortalShell>
  );
}
