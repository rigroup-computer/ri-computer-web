"use client";

import { Icon } from "@iconify/react";

import { formatIdr } from "@/lib/format-idr";

type OrderDetailActionFooterProps = Readonly<{
  variant: "cost" | "simple";
  total?: number;
  pending: boolean;
  draftLabel?: string;
  onSubmit: () => void;
}>;

export function OrderDetailActionFooter({
  variant,
  total = 0,
  pending,
  draftLabel,
  onSubmit,
}: OrderDetailActionFooterProps) {
  return (
    <div className="border-t border-[#dee1e6] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(23,26,31,0.14)]">
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
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={pending}
          className="flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl bg-[#171a1f] text-sm font-semibold text-white disabled:opacity-60"
        >
          Simpan status{draftLabel ? ` · ${draftLabel}` : ""}
        </button>
      )}
    </div>
  );
}
