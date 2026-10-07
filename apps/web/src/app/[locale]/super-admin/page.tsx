import { SuperAdminHome } from "@/features/portal/super-admin-home";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { prepareLocale } from "@/i18n/locale";

export default async function SuperAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const me = await requireSuperAdmin();
  return <SuperAdminHome me={me} />;
}
