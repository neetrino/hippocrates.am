"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
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
    <button
      className={
        className ??
        "inline-flex cursor-pointer items-center justify-center rounded-full border border-accent/28 bg-white px-3.5 py-2 text-sm font-semibold text-accent transition-colors duration-160 hover:bg-accent-soft"
      }
      type="button"
      onClick={() => void logout()}
    >
      {t("logout")}
    </button>
  );
}
