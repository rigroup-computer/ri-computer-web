"use client";

import { Icon } from "@iconify/react";

import { formatIdr } from "@/lib/format-idr";

type OrderDetailActionFooterProps = Readonly<{
  variant: "cost" | "simple" | "resend-completion";
  total?: number;
  pending: boolean;
  draftLabel?: string;
  /** When true (status → Selesai), button hints WhatsApp will open to the customer. */
  notifyCustomerViaWhatsApp?: boolean;
  onSubmit: () => void;
  onDelete?: () => void;
}>;

export function OrderDetailActionFooter({
  variant,
  total = 0,
  pending,
  draftLabel,
  notifyCustomerViaWhatsApp = false,
  onSubmit,
  onDelete,
}: OrderDetailActionFooterProps) {
  return (
    <div className="border-t border-[#dee1e6] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-5px_20px_rgba(23,26,31,0.14)]">
      {variant === "cost" ? (
        <>
          <div className="mb-3 flex items-center justify-between rounded-lg bg-[#eff6ff] px-3 py-2.5">
            <span className="text-sm font-medium text-[#171a1f]">
              Estimasi Total Biaya
            </span>
            <span className="text-base font-bold text-[#1a73e8]">
              {formatIdr(BigInt(total))}
            </span>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={pending}
            className="flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-[#171a1f] text-sm font-semibold text-white disabled:opacity-60"
          >
            <Icon
              icon="mdi:message-text-outline"
              width={18}
              height={18}
              aria-hidden
            />
            Kirim Konfirmasi ke Pelanggan
          </button>
        </>
      ) : variant === "resend-completion" ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={pending}
            className="flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-[#171a1f] text-sm font-semibold text-white disabled:opacity-60"
          >
            <Icon
              icon="ic:baseline-whatsapp"
              width={18}
              height={18}
              aria-hidden
            />
            Kirim ulang WhatsApp selesai
          </button>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-[#f5c2c7] bg-[#fff5f5] text-sm font-semibold text-[#b42318] disabled:opacity-60"
            >
              <Icon
                icon="mdi:trash-can-outline"
                width={18}
                height={18}
                aria-hidden
              />
              Hapus data order
            </button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={pending}
          className="flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-[#171a1f] text-sm font-semibold text-white disabled:opacity-60"
        >
          {notifyCustomerViaWhatsApp ? (
            <Icon
              icon="ic:baseline-whatsapp"
              width={18}
              height={18}
              aria-hidden
            />
          ) : null}
          {notifyCustomerViaWhatsApp
            ? `Simpan & kirim WhatsApp${draftLabel ? ` · ${draftLabel}` : ""}`
            : `Simpan status${draftLabel ? ` · ${draftLabel}` : ""}`}
        </button>
      )}
    </div>
  );
}
