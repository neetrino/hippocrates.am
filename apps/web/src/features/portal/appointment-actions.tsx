"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { visitStarted } from "@/shared/visit-time";

type AppointmentActionsProps = {
  id: string;
  status: string;
  startsAt: string;
  mode: "patient" | "admin" | "doctor";
  proposedBy?: "PATIENT" | "STAFF";
  /** Lets the buttons sit in a parent row. The date panel stays on the next line. */
  inline?: boolean;
};

export function AppointmentActions(props: AppointmentActionsProps) {
  const t = useTranslations("common");
  const [error, setError] = useState("");
  const started = visitStarted(props.startsAt);
  const open = props.status === "REQUESTED" || props.status === "CONFIRMED";
  const staff = props.mode === "admin" || props.mode === "doctor";
  const staffProposal = props.proposedBy === "STAFF";
  const canAccept = props.mode === "patient" && props.status === "REQUESTED" && staffProposal && !started;
  const canConfirm = staff && props.status === "REQUESTED" && !staffProposal && !started;
  const canComplete = staff && props.status === "CONFIRMED" && started;
  const canMiss = canComplete;
  const canCancel = open && !started;
  if (!canAccept && !canConfirm && !canComplete && !canCancel) return null;

  async function run(path: string): Promise<void> {
    setError((await postVisit(props.id, path, undefined)) || "");
  }

  return (
    <div className={props.inline ? "contents" : "grid justify-items-start gap-2"}>
      <div className="flex flex-wrap gap-2">
        {canAccept ? <Action label={t("accept")} tone="primary" onClick={() => void run("/confirm")} /> : null}
        {canConfirm ? <Action label={t("confirm")} tone="primary" onClick={() => void run("/confirm")} /> : null}
        {canComplete ? <Action label={t("complete")} tone="primary" onClick={() => void run("/complete")} /> : null}
        {canMiss ? <Action label={t("noShow")} tone="secondary" onClick={() => void run("/no-show")} /> : null}
        {canCancel ? (
          <CancelVisit id={props.id} confirmed={props.status === "CONFIRMED"} onError={setError} />
        ) : null}
      </div>
      {error ? <p className="m-0 basis-full text-sm text-danger">{error === "failed" ? t("failed") : error}</p> : null}
    </div>
  );
}

function Action({ label, tone, onClick }: { label: string; tone: "primary" | "secondary"; onClick: () => void }) {
  const toneClass = tone === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <button className={`btn ${toneClass} min-h-9 px-3.5 py-2 text-sm`} type="button" onClick={onClick}>
      {label}
    </button>
  );
}

function CancelVisit({ id, confirmed, onError }: { id: string; confirmed: boolean; onError: (message: string) => void }) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  if (!confirmed) {
    return (
      <button className="btn btn-danger min-h-9 px-3.5 py-2 text-sm" type="button" onClick={() => void submit(id, undefined, onError)}>
        {t("cancel")}
      </button>
    );
  }

  return (
    <div className="contents">
      <button className="btn btn-danger min-h-9 px-3.5 py-2 text-sm" type="button" onClick={() => setOpen(true)}>
        {t("cancel")}
      </button>
      {open ? (
        <form
          className="grid basis-full gap-2 rounded-[1.1rem] bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(id, reason, onError);
          }}
        >
          <p className="m-0 text-sm font-semibold text-ink">{t("cancelConfirmed")}</p>
          <textarea
            className="field-control min-h-20"
            maxLength={200}
            value={reason}
            placeholder={t("cancelReason")}
            onChange={(event) => setReason(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-danger min-h-9 px-3.5 py-2 text-sm" type="submit">
              {t("cancel")}
            </button>
            <button className="btn btn-secondary min-h-9 px-3.5 py-2 text-sm" type="button" onClick={() => setOpen(false)}>
              {t("keepVisit")}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

async function submit(id: string, reason: string | undefined, onError: (message: string) => void): Promise<void> {
  onError((await postVisit(id, "/cancel", reason)) || "");
}

async function postVisit(id: string, path: string, reason: string | undefined): Promise<string | null> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments/${id}${path}`, {
    method: "POST",
    credentials: "include",
    headers: reason === undefined ? undefined : { "content-type": "application/json" },
    body: reason === undefined ? undefined : JSON.stringify({ reason }),
  });
  if (response.ok) {
    window.location.reload();
    return null;
  }
  return "failed";
}
