"use client";

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { LogoutButton } from "@/features/portal/logout-button";
import { Link } from "@/i18n/navigation";

export type AccountHref = "/login" | "/me" | "/clinic" | "/super-admin";

const circleClass =
  "grid h-10 w-10 cursor-pointer place-items-center rounded-full border-0 bg-accent p-0 text-white transition-[background] duration-160 hover:bg-accent-hover max-md:h-[38px] max-md:w-[38px]";

const profileIconClass =
  "grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-line bg-surface p-0 text-ink transition-[color,border-color] duration-160 hover:border-accent hover:text-accent max-md:h-[38px] max-md:w-[38px]";

const rowClass =
  "inline-flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2.5 text-left font-sans text-[0.86rem] font-medium text-ink/85 transition-colors duration-160 hover:bg-accent-soft hover:text-accent";

type AccountMenuProps = {
  href: AccountHref;
  label: string;
};

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 19.2c1.4-3.1 3.7-4.6 6.5-4.6s5.1 1.5 6.5 4.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function useDismiss(open: boolean, close: () => void, rootRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") close();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, rootRef]);
}

function SignedInMenu({ href, label }: { href: Exclude<AccountHref, "/login">; label: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, rootRef);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={circleClass}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <UserIcon />
      </button>
      {open ? (
        <div
          className="absolute top-[calc(100%+8px)] right-0 z-30 grid w-max min-w-[10.5rem] gap-0.5 rounded-xl border border-line bg-surface p-1.5 shadow-soft"
          id={menuId}
          role="menu"
        >
          <Link href={href} role="menuitem" className={rowClass} onClick={close}>
            {label}
          </Link>
          <LogoutButton className={rowClass} showIcon />
        </div>
      ) : null}
    </div>
  );
}

export function AccountMenu({ href, label }: AccountMenuProps) {
  if (href === "/login") {
    return (
      <Link href={href} className={profileIconClass} aria-label={label}>
        <UserIcon />
      </Link>
    );
  }
  return <SignedInMenu href={href} label={label} />;
}
