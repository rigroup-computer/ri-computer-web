"use client";

import { useState } from "react";
import type { ServiceStatus } from "@prisma/client";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { updateServiceOrderStatus } from "@/lib/actions/admin-orders";
import { SERVICE_ORDER_STATUS_FLOW } from "@/lib/service-order-status-flow";
import { serviceStatusLabel } from "@/lib/service-status-label";
import { toast } from "sonner";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function AdminOrderStatusSheet({
  orderId,
  currentStatus,
  onAfterStatusChange,
}: Readonly<{
  orderId: string;
  currentStatus: ServiceStatus;
  /** Dipanggil setelah status tersimpan (untuk refresh daftar RSC). */
  onAfterStatusChange?: () => void;
}>) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function applyStatus(next: ServiceStatus): Promise<void> {
    if (next === currentStatus) {
      setOpen(false);
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("orderId", orderId);
      fd.set("status", next);
      await updateServiceOrderStatus(fd);
      toast.success("Status diperbarui.");
      setOpen(false);
      onAfterStatusChange?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal memperbarui status.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={pending}
        onClick={() => setOpen(true)}
        className="mt-2 flex min-h-11 w-full touch-manipulation items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm font-medium text-slate-900 outline-none ring-blue-600/50 focus-visible:ring-2 disabled:opacity-60"
      >
        <span>{serviceStatusLabel(currentStatus)}</span>
        <ChevronDownIcon className="shrink-0 text-slate-400" />
      </button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Perbarui status"
        footer={
          <button
            type="button"
            className="h-12 w-full rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Batal
          </button>
        }
      >
        <ul className="flex flex-col gap-1 pb-2" role="listbox">
          {SERVICE_ORDER_STATUS_FLOW.map((status) => {
            const selected = currentStatus === status;
            return (
              <li key={status} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={pending}
                  className={`flex min-h-11 w-full items-center rounded-sm px-3 py-3 text-left text-sm font-medium ${
                    selected
                      ? "bg-blue-50 text-blue-900"
                      : "text-mate-black active:bg-slate-100"
                  }`}
                  onClick={() => void applyStatus(status)}
                >
                  {serviceStatusLabel(status)}
                  {selected ? (
                    <span
                      className="relative ml-auto aspect-square size-6 rounded-full border border-blue-600 text-mate-black/40 after:absolute after:left-1/2 after:top-1/2 after:size-[7px] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-blue-600 after:content-['']"
                      aria-hidden
                    />
                  ) : (
                    <span className="ml-auto aspect-square size-6 rounded-full border border-mate-black/40 text-mate-black/40" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </>
  );
}
