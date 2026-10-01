"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cx } from "@/shared/ui/cx";
import ui from "@/shared/ui/primitives.module.css";

export function LogoutButton() {
  const router = useRouter();
  const t = useTranslations("common");

  async function logout(): Promise<void> {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
    router.refresh();
  }

  return (
    <button className={cx(ui.btn, ui.btnGhost, ui.btnSmall)} type="button" onClick={() => void logout()}>
      {t("logout")}
    </button>
  );
}
