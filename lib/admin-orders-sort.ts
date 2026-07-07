import { VisitScheduleStatus } from "@prisma/client";

import type { OrderListRowData } from "@/components/admin/orders/order-row-data";

export type AdminOrdersSortKey =
  | "updatedAt-desc"
  | "updatedAt-asc"
  | "customerName-asc"
  | "customerName-desc";

export const ADMIN_ORDERS_SORT_OPTIONS: ReadonlyArray<{
  value: AdminOrdersSortKey;
  label: string;
}> = [
  { value: "updatedAt-desc", label: "Terbaru" },
  { value: "updatedAt-asc", label: "Terlama" },
  { value: "customerName-asc", label: "Nama A–Z" },
  { value: "customerName-desc", label: "Nama Z–A" },
];

export const DEFAULT_ADMIN_ORDERS_SORT: AdminOrdersSortKey = "updatedAt-desc";

export function adminOrdersSortLabel(sortKey: AdminOrdersSortKey): string {
  return (
    ADMIN_ORDERS_SORT_OPTIONS.find((option) => option.value === sortKey)?.label ??
    "Terbaru"
  );
}

function schedulePendingRank(order: OrderListRowData): number {
  if (
    order.visitScheduleStatus === VisitScheduleStatus.REQUESTED ||
    order.visitScheduleStatus === VisitScheduleStatus.DECLINED
  ) {
    return 0;
  }
  if (order.visitScheduleStatus === VisitScheduleStatus.RESCHEDULED) {
    return 1;
  }
  return 2;
}

function compareBySortKey(
  a: OrderListRowData,
  b: OrderListRowData,
  sortKey: AdminOrdersSortKey,
): number {
  switch (sortKey) {
    case "updatedAt-desc":
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    case "updatedAt-asc":
      return a.updatedAt.getTime() - b.updatedAt.getTime();
    case "customerName-asc":
      return a.customerName.localeCompare(b.customerName, "id");
    case "customerName-desc":
      return b.customerName.localeCompare(a.customerName, "id");
    default:
      return 0;
  }
}

export function sortOrderListRows(
  rows: OrderListRowData[],
  sortKey: AdminOrdersSortKey,
): OrderListRowData[] {
  const next = [...rows];
  return next.sort((a, b) => {
    const pendingDiff = schedulePendingRank(a) - schedulePendingRank(b);
    if (pendingDiff !== 0) {
      return pendingDiff;
    }
    return compareBySortKey(a, b, sortKey);
  });
}
