"use client";

import { useState, type ReactNode } from "react";

import { Modal } from "@/components/ui/modal";

export type ConfirmDialogVariant = "default" | "danger";

export type ConfirmDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Extra body content below the description. */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  pending?: boolean;
  closeOnOverlayClick?: boolean;
  /**
   * Called when confirm is pressed.
   * Close the dialog yourself on success via `onOpenChange(false)`.
   * On error, keep the dialog open (errors are swallowed after your handler runs).
   */
  onConfirm: () => void | Promise<void>;
}>;

const CONFIRM_CLASS: Record<ConfirmDialogVariant, string> = {
  default: "bg-[#171a1f] text-white hover:bg-[#2a2f38]",
  danger: "bg-[#b42318] text-white hover:bg-[#912018]",
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "default",
  pending = false,
  closeOnOverlayClick = true,
  onConfirm,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const isPending = pending || busy;

  async function handleConfirm(): Promise<void> {
    setBusy(true);
    try {
      await onConfirm();
    } catch {
      // Caller handles errors (toast, etc). Keep dialog open.
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      closeOnOverlayClick={closeOnOverlayClick && !isPending}
      closeOnEscape={!isPending}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl border border-[#dee1e6] bg-white px-4 text-sm font-semibold text-[#171a1f] disabled:opacity-60 sm:w-auto"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              void handleConfirm();
            }}
            className={`flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl px-4 text-sm font-semibold disabled:opacity-60 sm:w-auto ${CONFIRM_CLASS[variant]}`}
          >
            {isPending ? "Memproses…" : confirmLabel}
          </button>
        </div>
      }
    >
      {children}
    </Modal>
  );
}
