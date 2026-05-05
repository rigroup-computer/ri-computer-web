"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

const links = [
  { href: "/marketplace", label: "Laptop Dijual" },
  { href: "/booking", label: "Booking Servis" },
  { href: "/tracking", label: "Lacak Status" },
] as const;

function MenuLayer({ onClose }: Readonly<{ onClose: () => void }>) {
  const [slideIn, setSlideIn] = useState(false);

  useLayoutEffect(() => {
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => setSlideIn(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200]">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Tutup menu"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        className={`absolute inset-y-0 right-0 flex h-full w-full max-w-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:max-w-md ${
          slideIn ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <h2 className="min-w-0 flex-1 text-lg font-semibold text-mate-black">
            Menu
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
            aria-label="Tutup"
          >
            ✕
          </button>
        </header>

        <nav
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain py-2"
          aria-label="Navigasi utama"
        >
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block min-h-[48px] px-5 py-3 text-base font-medium text-mate-black hover:bg-slate-50 active:bg-slate-100"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function SiteHeaderNav() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const portal =
    open && typeof document !== "undefined"
      ? createPortal(<MenuLayer onClose={close} />, document.body)
      : null;

  return (
    <div className="flex shrink-0 touch-manipulation">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex min-h-14 min-w-14 cursor-pointer items-center justify-center rounded-lg text-slate-700 [-webkit-tap-highlight-color:transparent] hover:bg-slate-100 active:bg-slate-100"
      >
        <span className="sr-only">Buka menu</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height={24}
          viewBox="0 -960 960 960"
          width={24}
          fill="currentColor"
          aria-hidden
          className="pointer-events-none"
        >
          <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
        </svg>
      </button>
      {portal}
    </div>
  );
}
