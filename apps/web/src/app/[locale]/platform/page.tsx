import { prepareLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function PlatformPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const me = await sessionGet<Me>("/auth/me");

  if (me?.role === "SUPER_ADMIN") {
    redirect({ href: "/super-admin/clinics", locale });
  }
  if (me?.role === "ADMIN") redirect({ href: "/clinic", locale });
  if (me) redirect({ href: "/me", locale });
  redirect({ href: "/login", locale });
}
