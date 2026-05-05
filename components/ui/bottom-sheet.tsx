"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useId,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type BottomSheetProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title?: ReactNode;
  children: ReactNode;
  /** Slot di bawah konten (mis. tombol sekunder) */
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  zIndexClass?: string;
  overlayClassName?: string;
  sheetClassName?: string;
  /** Override tinggi maks. panel (mis. kalender butuh lebih tinggi ke atas) */
  sheetMaxHeightClass?: string;
  /** Bilah pegangan seperti sheet native iOS */
  showHandle?: boolean;
  ariaLabel?: string;
};

export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  lockScroll = true,
  zIndexClass = "z-[100]",
  overlayClassName = "",
  sheetClassName = "",
  sheetMaxHeightClass = "max-h-[min(85dvh,100%)]",
  showHandle = true,
  ariaLabel = "Panel bawah",
}: BottomSheetProps) {
  const titleId = useId();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open || !closeOnEscape) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, close]);

  useEffect(() => {
    if (!open || !lockScroll) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, lockScroll]);

  const overlayActive = open ? "opacity-100" : "opacity-0";
  const sheetActive = open ? "translate-y-0" : "translate-y-full";
  const pointer = open ? "pointer-events-auto" : "pointer-events-none";

  const layer = (
    <div
      className={`fixed inset-0 ${zIndexClass} ${pointer} flex flex-col justify-end`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ease-out ${overlayActive} ${open ? "pointer-events-auto" : "pointer-events-none"} ${overlayClassName}`.trim()}
        onClick={() => {
          if (open && closeOnOverlayClick) {
            close();
          }
        }}
        aria-label="Tutup panel"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ? undefined : ariaLabel}
        aria-labelledby={title ? titleId : undefined}
        className={`relative z-[1] flex w-full flex-col rounded-t-3xl border border-b-0 border-slate-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${sheetMaxHeightClass} ${sheetActive} ${sheetClassName}`.trim()}
      >
        {showHandle ? (
          <div className="flex shrink-0 justify-center pt-3 pb-1" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-slate-300" />
          </div>
        ) : null}

        {title ? (
          <header className="shrink-0 border-b border-slate-100 px-4 pb-3 pt-1">
            <h2 id={titleId} className="text-center text-base font-semibold text-mate-black">
              {title}
            </h2>
          </header>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-slate-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );

  return mounted ? createPortal(layer, document.body) : null;
}
