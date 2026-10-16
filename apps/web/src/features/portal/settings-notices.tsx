"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { accountRequest } from "@/features/portal/settings-request";

/** Turns visit emails on or off for the signed-in account. */
export function SettingsNotices({ enabled }: { enabled: boolean }) {
  const t = useTranslations("me");
  const [on, setOn] = useState(enabled);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function toggle(): Promise<void> {
    const next = !on;
    setBusy(true);
    setFailed(false);
    const result = await accountRequest("/auth/me/notice-mail", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ emailVisitNotices: next }),
    });
    setBusy(false);
    if (!result.ok) {
      setFailed(true);
      return;
    }
    setOn(next);
  }

  return (
    <div className="border-b border-line py-6">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-4 shrink-0 accent-accent"
          checked={on}
          disabled={busy}
          onChange={() => void toggle()}
        />
        <span>
          <span className="font-semibold text-ink">{t("emailNotices")}</span>
          <span className="mt-1 block text-sm text-muted">{t("emailNoticesHint")}</span>
        </span>
      </label>
      {failed ? <p className="m-0 mt-3 text-sm text-danger">{t("emailNoticesFailed")}</p> : null}
    </div>
  );
}
