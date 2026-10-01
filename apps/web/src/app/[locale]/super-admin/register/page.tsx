import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { prepareLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";

export default async function PortalRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = prepareLocale(locale);
  await requireSuperAdmin();
  redirect({ href: "/super-admin/clinics", locale: resolvedLocale });
}
