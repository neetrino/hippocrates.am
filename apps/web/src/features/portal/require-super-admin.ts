import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Me } from "@/shared/public-types";
import { accountHome } from "@/shared/role-home";
import { sessionGet } from "@/shared/session-api";

/** Ensure the current session is a Super Admin, otherwise send them to their role home. */
export async function requireSuperAdmin(): Promise<Me> {
  const me = await sessionGet<Me>("/auth/me");
  if (me?.role === "SUPER_ADMIN") return me;
  const locale = (await getLocale()) as AppLocale;
  if (me) redirect({ href: accountHome(me.role), locale });
  redirect({ href: "/login", locale });
  throw new Error("Super Admin required");
}
