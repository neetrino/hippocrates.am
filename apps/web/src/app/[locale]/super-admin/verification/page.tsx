import { getTranslations } from "next-intl/server";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { VerificationBoard } from "@/features/portal/verification-board";
import type { VerificationQueue } from "@/features/portal/verification-status";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";

const emptyQueue: VerificationQueue = { clinics: [], doctors: [] };

export default async function VerificationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  await requireSuperAdmin();
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const queue = (await sessionGet<VerificationQueue>("/admin/verification")) ?? emptyQueue;

  return (
    <AdminPortalShell eyebrow={common("SUPER_ADMIN")} title={portal("verification")}>
      <VerificationBoard queue={queue} />
    </AdminPortalShell>
  );
}
