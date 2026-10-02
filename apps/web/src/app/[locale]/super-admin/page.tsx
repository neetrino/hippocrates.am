import { SuperAdminHome } from "@/features/portal/super-admin-home";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { prepareLocale } from "@/i18n/locale";
import type { AppointmentCard } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

type Notice = { id: string; body: string; createdAt: string };

export default async function SuperAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const me = await requireSuperAdmin();
  const appointments = (await sessionGet<AppointmentCard[]>("/appointments/mine")) ?? [];
  const notices = (await sessionGet<Notice[]>("/me/notifications")) ?? [];
  return <SuperAdminHome me={me} appointments={appointments} notices={notices} />;
}
