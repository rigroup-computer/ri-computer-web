import { VisitScheduleStatus } from "@prisma/client";

import type { AdminStatusBucket } from "@/lib/admin-order-status-display";
import {
  formatVisitDateTimeId,
  visitScheduleStatusLabel,
} from "@/lib/store-hours";

import type { OrderListRowData } from "./order-row-data";

type OrderVisitScheduleBadgeProps = Readonly<
  Pick<
    OrderListRowData,
    "visitScheduleStatus" | "confirmedVisitAt" | "preferredVisitAt" | "bucket"
  >
>;

export function shouldShowVisitScheduleBadge(
  order: Pick<
    OrderListRowData,
    "visitScheduleStatus" | "confirmedVisitAt" | "preferredVisitAt"
  >,
): boolean {
  if (order.visitScheduleStatus === VisitScheduleStatus.REQUESTED) {
    return true;
  }
  if (order.visitScheduleStatus === VisitScheduleStatus.DECLINED) {
    return true;
  }
  if (order.confirmedVisitAt) {
    return true;
  }
  if (order.preferredVisitAt) {
    return true;
  }
  return false;
}

function badgeClassName(
  status: VisitScheduleStatus,
  bucket: AdminStatusBucket,
): string {
  const base =
    "mt-1.5 inline-flex max-w-full items-center rounded-[10px] px-2 py-0.5 text-[10px] font-medium leading-snug";

  switch (status) {
    case VisitScheduleStatus.REQUESTED:
      return `${base} ${
        bucket === "antrian"
          ? "border border-amber-300 bg-amber-50 font-semibold text-amber-900"
          : "border border-amber-200 bg-amber-50 text-amber-800"
      }`;
    case VisitScheduleStatus.CONFIRMED:
      return `${base} border border-emerald-200 bg-emerald-50 text-emerald-800`;
    case VisitScheduleStatus.RESCHEDULED:
      return `${base} border border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]`;
    case VisitScheduleStatus.DECLINED:
      return `${base} ${
        bucket === "antrian"
          ? "border border-amber-300 bg-amber-50 font-semibold text-amber-900"
          : "border border-amber-200 bg-amber-50 text-amber-800"
      }`;
  }
}

function badgeLabel(
  status: VisitScheduleStatus,
  confirmedVisitAt: Date | null,
  preferredVisitAt: Date | null,
): string {
  switch (status) {
    case VisitScheduleStatus.REQUESTED:
      return "Perlu konfirmasi jadwal";
    case VisitScheduleStatus.CONFIRMED: {
      const date = confirmedVisitAt ?? preferredVisitAt;
      return date
        ? `${formatVisitDateTimeId(date)} WIB`
        : visitScheduleStatusLabel(status);
    }
    case VisitScheduleStatus.RESCHEDULED: {
      const date = confirmedVisitAt ?? preferredVisitAt;
      return date
        ? `Menunggu pelanggan · ${formatVisitDateTimeId(date)} WIB`
        : visitScheduleStatusLabel(status);
    }
    case VisitScheduleStatus.DECLINED:
      return visitScheduleStatusLabel(status);
  }
}

export function OrderVisitScheduleBadge({
  visitScheduleStatus,
  confirmedVisitAt,
  preferredVisitAt,
  bucket,
}: OrderVisitScheduleBadgeProps) {
  if (
    !shouldShowVisitScheduleBadge({
      visitScheduleStatus,
      confirmedVisitAt,
      preferredVisitAt,
    })
  ) {
    return null;
  }

  return (
    <span
      className={badgeClassName(visitScheduleStatus, bucket)}
      title={visitScheduleStatusLabel(visitScheduleStatus)}
    >
      {badgeLabel(visitScheduleStatus, confirmedVisitAt, preferredVisitAt)}
    </span>
  );
}
