"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { PatientAvatar } from "@/features/portal/patient-avatar";
import { accountRequest } from "@/features/portal/settings-request";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type SettingsPhotoProps = {
  name: string;
  photoUrl: string | null;
  roleLabel: string;
  changeLabel: string;
  changeAction: string;
  deleteAction: string;
  failed: string;
  invalid: string;
  action?: ReactNode;
};

async function sendPhoto(file: File): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const response = await fetch(`${base}/api/v1/auth/me/photo`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": file.type },
    body: file,
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { data?: { photoUrl?: string } };
  return body.data?.photoUrl ?? null;
}

function PhotoMenu({
  menuId,
  changeAction,
  deleteAction,
  busy,
  onChange,
  onDelete,
}: {
  menuId: string;
  changeAction: string;
  deleteAction: string;
  busy: boolean;
  onChange: () => void;
  onDelete: () => void;
}) {
  const itemClass =
    "inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold transition-colors duration-160 disabled:opacity-60";
  return (
    <div id={menuId} role="menu" className="mt-3 grid w-max gap-2">
      <button
        type="button"
        role="menuitem"
        disabled={busy}
        className={`${itemClass} text-ink hover:border-accent/35 hover:text-accent`}
        onClick={onChange}
      >
        {changeAction}
      </button>
      <button
        type="button"
        role="menuitem"
        disabled={busy}
        className={`${itemClass} text-danger hover:border-danger/30 hover:bg-sand`}
        onClick={onDelete}
      >
        {deleteAction}
      </button>
    </div>
  );
}

export function SettingsPhoto({
  name,
  photoUrl,
  roleLabel,
  changeLabel,
  changeAction,
  deleteAction,
  failed,
  invalid,
  action,
}: SettingsPhotoProps) {
  const input = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const router = useRouter();
  const [current, setCurrent] = useState(photoUrl);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  async function onFile(file: File | undefined): Promise<void> {
    if (!file) return;
    if (!PHOTO_TYPES.has(file.type) || file.size > MAX_PHOTO_BYTES) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError("");
    const next = await sendPhoto(file);
    setBusy(false);
    if (!next) {
      setError(failed);
      return;
    }
    setCurrent(next);
    router.refresh();
  }

  async function onRemove(): Promise<void> {
    setMenuOpen(false);
    setBusy(true);
    setError("");
    const result = await accountRequest("/auth/me/photo", { method: "DELETE" });
    setBusy(false);
    if (!result.ok) {
      setError(result.message || failed);
      return;
    }
    setCurrent(null);
    router.refresh();
  }

  function onAvatarClick(): void {
    if (!current) {
      input.current?.click();
      return;
    }
    setMenuOpen((open) => !open);
  }

  return (
    <div className="mb-6 border-b border-line pb-6" ref={rootRef}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          aria-label={changeLabel}
          aria-haspopup={current ? "menu" : undefined}
          aria-expanded={current ? menuOpen : undefined}
          aria-controls={current && menuOpen ? menuId : undefined}
          disabled={busy}
          onClick={onAvatarClick}
          className="group relative grid h-20 w-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border-0 bg-transparent p-0 disabled:opacity-60"
        >
          <PatientAvatar name={name} photoUrl={current} className="h-20 w-20 text-2xl" />
          {current ? null : (
            <span
              className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/50 text-[1.7rem] leading-none font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden="true"
            >
              +
            </span>
          )}
        </button>
        <div className="min-w-0">
          <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-accent uppercase">{roleLabel}</p>
          <p className="m-0 truncate font-display text-[1.45rem] leading-tight font-bold text-ink">{name}</p>
        </div>
        </div>
        {action}
      </div>
      {current && menuOpen ? (
        <PhotoMenu
          menuId={menuId}
          changeAction={changeAction}
          deleteAction={deleteAction}
          busy={busy}
          onChange={() => {
            setMenuOpen(false);
            input.current?.click();
          }}
          onDelete={() => void onRemove()}
        />
      ) : null}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void onFile(file);
        }}
      />
      {error ? <p className="m-0 mt-3 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
