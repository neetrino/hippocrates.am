import { getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

/** Patient session for `/me/*` pages. Other roles are sent to their own home. */
export async function loadPatientAccount(locale: AppLocale): Promise<Me | null> {
  const me = await sessionGet<Me>("/auth/me");
  if (!me) return null;
  if (me.role === "SUPER_ADMIN") redirect({ href: "/super-admin", locale });
  if (me.role !== "PATIENT") redirect({ href: "/me", locale });
  return me;
}

export async function PatientSignIn() {
  const t = await getTranslations("me");
  const nav = await getTranslations("nav");
  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      <p>
        {t("signIn")} <Link href="/login">{nav("login")}</Link>
      </p>
    </div>
  );
}
