"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { VerificationDecision, VerificationKind } from "@/features/portal/verification-status";

export function VerificationActions({
  kind,
  id,
  status,
}: {
  kind: VerificationKind;
  id: string;
  status: string;
}) {
  const t = useTranslations("portal");
  const router = useRouter();
  const [busy, setBusy] = useState<VerificationDecision | null>(null);
  const [failed, setFailed] = useState(false);
  const approved = status === "APPROVED";

  async function decide(decision: VerificationDecision): Promise<void> {
    setBusy(decision);
    setFailed(false);
    const ok = await sendDecision(kind, id, decision);
    setBusy(null);
    if (!ok) {
      setFailed(true);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {approved ? null : (
        <button className="btn btn-primary min-h-10 px-4" type="button" disabled={busy !== null} onClick={() => void decide("APPROVE")}>
          {busy === "APPROVE" ? "…" : t("verifyApprove")}
        </button>
      )}
      {status === "REJECTED" || approved ? null : (
        <button className="btn btn-secondary min-h-10 px-4" type="button" disabled={busy !== null} onClick={() => void decide("REJECT")}>
          {busy === "REJECT" ? "…" : t("verifyReject")}
        </button>
      )}
      {approved ? (
        <button className="btn btn-secondary min-h-10 px-4" type="button" disabled={busy !== null} onClick={() => void decide("SUSPEND")}>
          {busy === "SUSPEND" ? "…" : t("verifySuspend")}
        </button>
      ) : null}
      {failed ? <p className="m-0 text-sm text-danger">{t("verifyFailed")}</p> : null}
    </div>
  );
}

async function sendDecision(kind: VerificationKind, id: string, decision: VerificationDecision): Promise<boolean> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/verification/${kind}/${id}`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ decision }),
  });
  return response.ok;
}
