"use client";

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { LogoutButton } from "@/features/portal/logout-button";
import { Link } from "@/i18n/navigation";

export type AccountHref = "/login" | "/me" | "/super-admin";

const circleClass =
  "grid h-[42px] w-[42px] cursor-pointer place-items-center rounded-full border-0 bg-accent p-0 text-white shadow-accent transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-[0_12px_24px_rgba(0,167,157,0.28)] max-md:h-[38px] max-md:w-[38px]";

const rowClass =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-transparent px-2 text-left font-sans text-[0.78rem] font-medium whitespace-nowrap text-ink/80 transition-colors duration-160 hover:bg-accent-soft hover:text-accent";

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

function SignedInMenu({ label }: { label: string }) {
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
          className="absolute top-[calc(100%+6px)] right-0 z-30 w-max rounded-xl border border-line bg-white p-1 shadow-[0_8px_20px_rgba(20,36,40,0.08)]"
          id={menuId}
          role="menu"
        >
          <LogoutButton className={rowClass} showIcon />
        </div>
      ) : null}
    </div>
  );
}

export function AccountMenu({ href, label }: AccountMenuProps) {
  if (href === "/login") {
    return (
      <Link href={href} className={circleClass} aria-label={label}>
        <UserIcon />
      </Link>
    );
  }
  return <SignedInMenu label={label} />;
}
