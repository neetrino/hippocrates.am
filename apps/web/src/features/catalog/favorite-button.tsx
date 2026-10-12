"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type FavoriteButtonProps = {
  kind: "clinic" | "doctor";
  id: string;
  saved: boolean;
  tone?: "overlay" | "inline";
  className?: string;
};

export function FavoriteButton({ kind, id, saved, tone = "overlay", className = "" }: FavoriteButtonProps) {
  const t = useTranslations("me");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const path = kind === "clinic" ? "clinics" : "doctors";

  async function toggle(): Promise<void> {
    if (pending) return;
    setPending(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorites/${path}/${id}`, {
      method: saved ? "DELETE" : "POST",
      credentials: "include",
    });
    setPending(false);
    if (response.status === 401) {
      router.push("/login");
      return;
    }
    if (response.ok) router.refresh();
  }

  const face = tone === "overlay" ? "bg-white/92 text-ink shadow-soft backdrop-blur-sm" : "bg-sand text-ink";

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? t("removeFavorite") : t("saveFavorite")}
      disabled={pending}
      className={`grid h-10 w-10 cursor-pointer place-items-center rounded-full transition hover:text-accent disabled:cursor-wait ${saved ? "text-accent" : ""} ${face} ${className}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggle();
      }}
    >
      <Heart filled={saved} />
    </button>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M12 19.2s-6.4-3.9-8.2-7.4C2.4 9.2 3.6 6.2 6.6 5.6c1.7-.3 3.2.4 4 1.8.8-1.4 2.3-2.1 4-1.8 3 .6 4.2 3.6 2.8 6.2-1.8 3.5-8.2 7.4-8.2 7.4Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
