import { getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Me } from "@/shared/public-types";
import { PageStack } from "@/shared/ui/page-frame";
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
    <PageStack>
      <p>
        {t("signIn")}{" "}
        <Link href="/login" className="font-semibold text-accent hover:text-accent-hover">
          {nav("login")}
        </Link>
      </p>
    </PageStack>
  );
}
