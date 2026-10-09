"use client";

import { useEffect, useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, RegisterClinicIcon } from "@/features/portal/admin-sidebar-icons";
import { RegisterClinicForm } from "@/features/portal/register-clinic-form";
import { cn } from "@/shared/ui/cn";

type AddClinicSheetProps = {
  addLabel: string;
  closeLabel: string;
  title: string;
  hint: string;
  submitLabel: string;
};

const SHEET_MS = 420;

function subscribeNoop(): () => void {
  return () => undefined;
}

export function AddClinicSheet({
  addLabel,
  closeLabel,
  title,
  hint,
  submitLabel,
}: AddClinicSheetProps) {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const titleId = useId();

  useEffect(() => {
    if (!visible) return;
    const frame = window.requestAnimationFrame(() => setEntered(true));
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [visible]);

  function open(): void {
    setVisible(true);
  }

  function close(): void {
    setEntered(false);
    window.setTimeout(() => setVisible(false), SHEET_MS);
  }

  const sheet: ReactNode = (
    <div className="fixed inset-0 z-[80]" role="presentation">
      <button
        type="button"
        className={cn(
          "absolute inset-0 cursor-pointer border-0 bg-[rgba(14,20,20,0.42)] p-0 transition-opacity duration-[420ms]",
          entered ? "opacity-100" : "opacity-0",
        )}
        aria-label={closeLabel}
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute inset-y-0 right-0 flex w-[min(100%,52vw)] max-w-[640px] flex-col rounded-tl-[1.75rem] rounded-bl-[1.75rem] bg-white shadow-[-18px_0_48px_rgba(20,36,40,0.14)] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          entered ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-5 md:px-7">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[clamp(1.35rem,2.2vw,1.7rem)]">
              {title}
            </h2>
            <p className="mt-1.5 mb-0 text-muted">{hint}</p>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-sand text-ink transition-colors duration-160 hover:border-accent hover:text-accent"
            aria-label={closeLabel}
            onClick={close}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div
          className={cn(
            "scrollbar-soft min-h-0 flex-1 overflow-y-auto px-5 py-5 transition-[opacity,transform] duration-300 ease-out md:px-7 md:py-6",
            entered ? "translate-y-0 opacity-100 delay-150" : "translate-y-3 opacity-0 delay-0",
          )}
        >
          <RegisterClinicForm submitLabel={submitLabel} />
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="btn btn-primary h-12 w-[10.5rem] shrink-0 grow-0 gap-2 whitespace-nowrap max-md:w-full"
        onClick={open}
      >
        <RegisterClinicIcon className="h-4 w-4" />
        <span>{addLabel}</span>
      </button>
      {mounted && visible ? createPortal(sheet, document.body) : null}
    </>
  );
}
