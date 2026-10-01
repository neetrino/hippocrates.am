import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

/** Ensure the current session is a Super Admin, otherwise send them to login. */
export async function requireSuperAdmin(): Promise<Me> {
  const me = await sessionGet<Me>("/auth/me");
  if (me?.role === "SUPER_ADMIN") return me;
  const locale = (await getLocale()) as AppLocale;
  redirect({ href: "/login", locale });
}
