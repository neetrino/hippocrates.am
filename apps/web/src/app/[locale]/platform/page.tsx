import { prepareLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import type { Me } from "@/shared/public-types";
import { accountHome } from "@/shared/role-home";
import { sessionGet } from "@/shared/session-api";

export default async function PlatformPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const me = await sessionGet<Me>("/auth/me");

  if (me) redirect({ href: accountHome(me.role), locale });
  redirect({ href: "/login", locale });
}
