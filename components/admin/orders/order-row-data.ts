import type { ServiceStatus } from "@prisma/client";

import {
  formatTrackingIdDisplay,
  getAdminStatusBucket,
  type AdminStatusBucket,
} from "@/lib/admin-order-status-display";
import type { AdminDashboardRecentOrder } from "@/lib/admin-dashboard-stats";
import type { ServiceOrderCostLineItem } from "@/lib/service-order-cost-items";

export type OrderDeviceFields = Readonly<{
  laptopBrand: string | null;
  laptopModel: string | null;
}>;

export const ORDER_DEVICE_EMPTY_LIST = "Unit belum diisi";
export const ORDER_DEVICE_EMPTY_TABLE = "—";

export function formatOrderDeviceLabel(
  order: OrderDeviceFields,
  emptyLabel: string = ORDER_DEVICE_EMPTY_TABLE,
  separator = " ",
): string {
  const parts = [order.laptopBrand, order.laptopModel].filter(Boolean);
  return parts.length > 0 ? parts.join(separator) : emptyLabel;
}

export type OrderListRowData = Readonly<{
  id: string;
  trackingId: string;
  customerName: string;
  customerPhone: string;
  issue: string;
  laptopBrand: string | null;
  laptopModel: string | null;
  bucket: AdminStatusBucket;
  createdAt: Date;
  updatedAt: Date;
}>;

export type AdminSerializedOrder = Readonly<{
  id: string;
  trackingId: string;
  customerName: string;
  customerPhone: string;
  laptopBrand: string | null;
  laptopModel: string | null;
  issue: string;
  attachmentUrls: string[];
  visitAddress: string;
  preferredVisitAt: string | null;
  status: ServiceStatus;
  costConfirmationNote: string | null;
  costLineItems: ServiceOrderCostLineItem[];
  createdAt: string;
  updatedAt: string;
  timelines: ReadonlyArray<{
    id: string;
    title: string;
    note: string | null;
    createdAt: string;
  }>;
}>;

export function toOrderListRowDataFromSerialized(
  order: AdminSerializedOrder,
): OrderListRowData {
  return {
    id: order.id,
    trackingId: order.trackingId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    issue: order.issue,
    laptopBrand: order.laptopBrand,
    laptopModel: order.laptopModel,
    bucket: getAdminStatusBucket(order.status),
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
  };
}

export function toOrderListRowDataFromDashboard(
  order: AdminDashboardRecentOrder,
): OrderListRowData {
  return {
    id: order.id,
    trackingId: order.trackingId,
    customerName: order.customerName,
    customerPhone: "",
    issue: "",
    laptopBrand: order.laptopBrand,
    laptopModel: order.laptopModel,
    bucket: order.bucket,
    createdAt: order.updatedAt,
    updatedAt: order.updatedAt,
  };
}

export function resolveOrderUpdatedAt(
  orderUpdatedAt: Date,
  timelineCreatedAts: Date[],
): string {
  const timelineMax = timelineCreatedAts.reduce(
    (max, createdAt) => Math.max(max, createdAt.getTime()),
    0,
  );
  const updatedAtMs = Math.max(orderUpdatedAt.getTime(), timelineMax);
  return new Date(updatedAtMs).toISOString();
}

export function orderRowAriaLabel(
  order: Pick<OrderListRowData, "trackingId" | "customerName">,
): string {
  return `Buka detail pesanan ${formatTrackingIdDisplay(order.trackingId)}, ${order.customerName}`;
}
