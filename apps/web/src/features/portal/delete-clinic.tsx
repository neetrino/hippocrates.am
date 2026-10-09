"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { accountRequest } from "@/features/portal/settings-request";

const pill =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-160 hover:border-accent/35 hover:text-accent disabled:cursor-default disabled:opacity-50";
const danger =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-danger/30 bg-white px-4 py-2.5 text-sm font-semibold text-danger transition-colors duration-160 hover:bg-danger/10 disabled:cursor-default disabled:opacity-50";

export function DeleteClinic({ clinicId, clinicName }: { clinicId: string; clinicName: string }) {
  const portal = useTranslations("portal");
  const common = useTranslations("common");
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape" && !busy) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, busy]);

  async function remove(): Promise<void> {
    setBusy(true);
    setError("");
    const result = await accountRequest(`/clinics/${clinicId}`, { method: "DELETE" });
    if (!result.ok) {
      setBusy(false);
      setError(result.message || portal("deleteClinicFailed"));
      return;
    }
    router.push("/super-admin/clinics");
    router.refresh();
  }

  const dialog = (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer border-0 bg-[rgba(14,20,20,0.42)] p-0"
        aria-label={common("cancel")}
        disabled={busy}
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative grid w-full max-w-md gap-4 rounded-[1.6rem] bg-white p-6 shadow-soft"
      >
        <h2 id={titleId} className="m-0 leading-[1.35]">
          {clinicName}
        </h2>
        <p className="m-0 text-muted">{portal("deleteClinicBody")}</p>
        {error ? <p className="m-0 text-sm text-danger">{error}</p> : null}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className={pill} disabled={busy} onClick={() => setOpen(false)}>
            {common("cancel")}
          </button>
          <button type="button" className={danger} disabled={busy} onClick={() => void remove()}>
            {portal("deleteClinicAction")}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" className={`${danger} w-fit`} onClick={() => setOpen(true)}>
        {portal("deleteClinic")}
      </button>
      {open ? createPortal(dialog, document.body) : null}
    </>
  );
}
