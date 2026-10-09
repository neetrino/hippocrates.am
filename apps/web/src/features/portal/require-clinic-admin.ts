import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

/** Clinic admin session. Other roles leave this account. */
export async function requireClinicAdmin(): Promise<Me & { clinicId: string }> {
  const me = await sessionGet<Me>("/auth/me");
  const locale = await getLocale();
  if (!me) {
    redirect({ href: "/login", locale });
    throw new Error("Sign in required");
  }
  if (me.role === "SUPER_ADMIN") {
    redirect({ href: "/super-admin", locale });
    throw new Error("Super Admin required");
  }
  if (me.role !== "ADMIN" || !me.clinicId) {
    redirect({ href: "/me", locale });
    throw new Error("Clinic admin required");
  }
  return { ...me, clinicId: me.clinicId };
}
