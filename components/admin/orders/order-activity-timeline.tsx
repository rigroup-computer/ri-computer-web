"use client";

import { Icon } from "@iconify/react";
import type { ServiceStatus } from "@prisma/client";

import { appendServiceTimelineNote } from "@/lib/actions/admin-orders";
import { serviceStatusLabel } from "@/lib/service-status-label";

import type { AdminSerializedOrder } from "./order-row-data";

type OrderActivityTimelineProps = Readonly<{
  order: AdminSerializedOrder;
  draftStatus: ServiceStatus | null;
  onRefreshAfterAction: (action: () => Promise<void>) => Promise<void>;
}>;

function formatTimelineDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderActivityTimeline({
  order,
  draftStatus,
  onRefreshAfterAction,
}: OrderActivityTimelineProps) {
  const hasDraft = draftStatus !== null && draftStatus !== order.status;
  const savedTimelines = [...order.timelines].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="mt-5 border-t border-[#dee1e6] pt-4">
      <div className="flex items-center gap-2 my-4">
        <Icon
          icon="material-symbols:history-rounded"
          width={26}
          height={26}
          aria-hidden
          className="text-[#1A73E8FF]"
        />
        <p className="font-semibold text-base text-[#171a1f] uppercase">
          RIWAYAT AKTIVITAS
        </p>
      </div>

      <ul className="relative mt-4 space-y-0">
        {savedTimelines.map((item, index) => {
          const showConnector = index < savedTimelines.length - 1;
          return (
            <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
              {showConnector ? (
                <span
                  className="absolute left-[9px] top-5 h-[calc(100%-0.25rem)] w-px bg-[#dee1e6]"
                  aria-hidden
                />
              ) : null}
              <span
                className="relative z-10 mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#1a73e8]"
                aria-hidden
              >
                <span className="size-2 rounded-full bg-white" />
              </span>
              <div className="min-w-0 flex-1 -mt-0.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-[#171a1f]">
                    {item.title}
                  </p>
                  <time
                    dateTime={item.createdAt}
                    className="shrink-0 text-xs text-[#565d6d]"
                  >
                    {formatTimelineDate(item.createdAt)}
                  </time>
                </div>
                {item.note ? (
                  <p className="mt-0.5 whitespace-pre-line text-xs text-[#565d6d]">
                    {item.note}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}

        {hasDraft && draftStatus ? (
          <li className="relative flex gap-3">
            <span
              className="relative z-10 mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#c4c8cf]"
              aria-hidden
            >
              <span className="size-2 rounded-full bg-white" />
            </span>
            <div className="min-w-0 flex-1 -mt-0.5">
              <p className="text-sm font-semibold text-[#565d6d]">
                Status Baru: {serviceStatusLabel(draftStatus)}
              </p>
              <p className="mt-0.5 text-xs italic text-[#565d6d]">
                (Menunggu penyimpanan…)
              </p>
            </div>
          </li>
        ) : null}
      </ul>

      {/* <form
        action={(formData) =>
          onRefreshAfterAction(() => appendServiceTimelineNote(formData))
        }
        className="mt-4 grid gap-2"
      >
        <input type="hidden" name="orderId" value={order.id} />
        <input
          name="title"
          required
          className="h-10 rounded-lg border border-[#dee1e6] px-3 text-sm"
          placeholder="Judul pembaruan"
        />
        <textarea
          name="note"
          className="min-h-16 rounded-lg border border-[#dee1e6] px-3 py-2 text-sm"
          placeholder="Detail (opsional)"
        />
        <button
          type="submit"
          className="h-10 rounded-lg border border-[#dee1e6] text-sm font-semibold text-[#171a1f]"
        >
          Tambahkan catatan
        </button>
      </form> */}
    </div>
  );
}
