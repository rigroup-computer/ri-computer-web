"use client";

import { createPortal } from "react-dom";
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";

export type SlideOverSide = "left" | "right" | "top" | "bottom";

export type SlideOverProps = {
  children: ReactNode;
  trigger: ReactNode;
  side?: SlideOverSide;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  title?: ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  containerClassName?: string;
  overlayClassName?: string;
  panelClassName?: string;
  bodyClassName?: string;
  zIndexClass?: string;
  transitionDurationClass?: string;
  transitionEaseClass?: string;
  ariaLabel?: string;
  labelledBy?: string;
};

function mergeHandlers(
  original: React.MouseEventHandler | undefined,
  next: React.MouseEventHandler,
): React.MouseEventHandler {
  return (event) => {
    original?.(event);
    next(event);
  };
}

export function SlideOver({
  children,
  trigger,
  side = "right",
  open: openControlled,
  onOpenChange,
  defaultOpen = false,
  title,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  lockScroll = true,
  containerClassName = "",
  overlayClassName = "",
  panelClassName = "",
  bodyClassName = "flex flex-col gap-1 overflow-y-auto p-4 pb-10",
  zIndexClass = "z-[100]",
  transitionDurationClass = "duration-300",
  transitionEaseClass = "ease-out",
  ariaLabel = "Panel geser",
  labelledBy,
}: SlideOverProps) {
  const headingDomId = useId();
  const ariaLabelledBy = labelledBy ?? (title ? headingDomId : undefined);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = openControlled !== undefined;
  const open = controlled ? openControlled : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const openPanel = useCallback(() => setOpen(true), [setOpen]);
  const closePanel = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!open || !closeOnEscape) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, closePanel]);

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

  const triggerNode = useMemo(() => {
    if (isValidElement(trigger)) {
      const el = trigger as ReactElement<{
        onClick?: React.MouseEventHandler;
        type?: string;
      }>;
      const extra: Record<string, unknown> = {
        onClick: mergeHandlers(el.props.onClick, openPanel),
        "aria-expanded": open,
        "aria-haspopup": "dialog" as const,
      };
      if (typeof el.type === "string" && el.type === "button") {
        extra.type = el.props.type ?? "button";
      }
      return cloneElement(el, extra);
    }
    return (
      <button type="button" aria-expanded={open} aria-haspopup="dialog" onClick={openPanel}>
        {trigger}
      </button>
    );
  }, [trigger, open, openPanel]);

  const motion = `${transitionDurationClass} ${transitionEaseClass} will-change-transform`;

  const panelBase = `absolute z-[1] flex flex-col bg-white shadow-2xl transition-transform ${motion} ${panelClassName}`.trim();

  const panelPosition = useMemo(() => {
    switch (side) {
      case "left":
        return `${panelBase} inset-y-0 left-0 h-full w-full max-w-md border-r border-slate-200 ${open ? "translate-x-0" : "-translate-x-full"}`;
      case "right":
        return `${panelBase} inset-y-0 right-0 h-full w-full max-w-md border-l border-slate-200 ${open ? "translate-x-0" : "translate-x-full"}`;
      case "top":
        return `${panelBase} inset-x-0 top-0 max-h-[min(90vh,100%)] w-full rounded-b-2xl border-b border-slate-200 ${open ? "translate-y-0" : "-translate-y-full"}`;
      case "bottom":
        return `${panelBase} inset-x-0 bottom-0 max-h-[min(90vh,100%)] w-full rounded-t-2xl border-t border-slate-200 ${open ? "translate-y-0" : "translate-y-full"}`;
      default:
        return `${panelBase} inset-y-0 right-0 h-full w-full max-w-md ${open ? "translate-x-0" : "translate-x-full"}`;
    }
  }, [side, open, panelBase]);

  const overlayClasses = `${open ? "opacity-100" : "opacity-0"} transition-opacity ${transitionDurationClass} ${transitionEaseClass}`;

  /** Saat tertutup: di bawah sticky header (z-30) supaya tap tidak tertelan; saat terbuka: di atas semua. */
  const shellZIndex = open ? zIndexClass : "z-0";
  const shellPointer = open ? "pointer-events-auto" : "pointer-events-none";

  const layer = (
    <div
      className={`fixed inset-0 ${shellZIndex} ${shellPointer} ${containerClassName}`.trim()}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        className={`absolute inset-0 bg-black/45 ${overlayClasses} ${overlayPointerForOpen(open)} ${overlayClassName}`.trim()}
        onClick={() => {
          if (open && closeOnOverlayClick) {
            closePanel();
          }
        }}
        aria-label="Tutup panel"
      />

      <div
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        className={`${panelPosition} ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {(title || showCloseButton) && (
          <header
            className={`flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 py-3 ${title ? "justify-between" : "justify-end"}`}
          >
            {title ? (
              <div id={labelledBy ? undefined : headingDomId} className="min-w-0 flex-1 text-lg font-semibold text-mate-black">
                {title}
              </div>
            ) : showCloseButton ? (
              <span className="sr-only">{ariaLabel}</span>
            ) : null}
            {showCloseButton ? (
              <button
                type="button"
                onClick={closePanel}
                className="flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                aria-label="Tutup"
              >
                ✕
              </button>
            ) : null}
          </header>
        )}

        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  );

  return (
    <>
      {triggerNode}
      {mounted ? createPortal(layer, document.body) : null}
    </>
  );
}

function overlayPointerForOpen(open: boolean) {
  return open ? "pointer-events-auto" : "pointer-events-none";
}
