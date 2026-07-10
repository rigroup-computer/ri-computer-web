"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useId,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ModalProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  /** Panel max width. Default `sm` (~24rem). */
  size?: "sm" | "md";
  zIndexClass?: string;
  overlayClassName?: string;
  panelClassName?: string;
  ariaLabel?: string;
}>;

const SIZE_CLASS: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
};

export function Modal({
  open,
  onOpenChange,
  children,
  title,
  description,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  lockScroll = true,
  size = "sm",
  zIndexClass = "z-[110]",
  overlayClassName = "",
  panelClassName = "",
  ariaLabel = "Dialog",
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
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

  if (!mounted) {
    return null;
  }

  const overlayActive = open ? "opacity-100" : "opacity-0";
  const panelActive = open
    ? "opacity-100 scale-100 translate-y-0"
    : "opacity-0 scale-95 translate-y-2";
  const pointer = open ? "pointer-events-auto" : "pointer-events-none";

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} ${pointer} flex items-center justify-center p-4`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out ${overlayActive} ${open ? "pointer-events-auto" : "pointer-events-none"} ${overlayClassName}`.trim()}
        onClick={() => {
          if (open && closeOnOverlayClick) {
            close();
          }
        }}
        aria-label="Tutup dialog"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ? undefined : ariaLabel}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={`relative z-[1] w-full ${SIZE_CLASS[size]} rounded-2xl border border-[#dee1e6] bg-white p-5 shadow-[0_20px_50px_rgba(23,26,31,0.28)] transition-[opacity,transform] duration-200 ease-out ${panelActive} ${panelClassName}`.trim()}
      >
        {title ? (
          <h2
            id={titleId}
            className="text-base font-semibold text-[#171a1f]"
          >
            {title}
          </h2>
        ) : null}

        {description ? (
          <p
            id={descriptionId}
            className={`text-sm leading-relaxed text-[#565d6d] ${title ? "mt-2" : ""}`}
          >
            {description}
          </p>
        ) : null}

        {children ? (
          <div className={title || description ? "mt-4" : ""}>{children}</div>
        ) : null}

        {footer ? <div className="mt-5">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
