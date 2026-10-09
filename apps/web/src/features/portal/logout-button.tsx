"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type LogoutButtonProps = {
  className?: string;
  showIcon?: boolean;
};

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5 shrink-0">
      <path
        d="M10 6.5V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M13.5 12H4m0 0 2.4-2.4M4 12l2.4 2.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoutButton({ className, showIcon = false }: LogoutButtonProps) {
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
      {showIcon ? <LogoutIcon /> : null}
      {t("logout")}
    </button>
  );
}
