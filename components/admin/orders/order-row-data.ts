import { VisitScheduleStatus, type ServiceStatus, type ServiceType } from "@prisma/client";

import {
  formatTrackingIdDisplay,
  getAdminStatusBucket,
  type AdminStatusBucket,
} from "@/lib/admin-order-status-display";
import type { AdminDashboardRecentOrder } from "@/src/lib/sdk/orders";
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
  serviceType: ServiceType;
  laptopBrand: string | null;
  laptopModel: string | null;
  bucket: AdminStatusBucket;
  visitScheduleStatus: VisitScheduleStatus;
  confirmedVisitAt: Date | null;
  preferredVisitAt: Date | null;
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
  confirmedVisitAt: string | null;
  visitScheduleStatus: VisitScheduleStatus;
  visitScheduleNote: string | null;
  serviceType: ServiceType;
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
    serviceType: order.serviceType,
    laptopBrand: order.laptopBrand,
    laptopModel: order.laptopModel,
    bucket: getAdminStatusBucket(order.status),
    visitScheduleStatus: order.visitScheduleStatus,
    confirmedVisitAt: order.confirmedVisitAt
      ? new Date(order.confirmedVisitAt)
      : null,
    preferredVisitAt: order.preferredVisitAt
      ? new Date(order.preferredVisitAt)
      : null,
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
    serviceType: order.serviceType,
    laptopBrand: order.laptopBrand,
    laptopModel: order.laptopModel,
    bucket: order.bucket,
    visitScheduleStatus: VisitScheduleStatus.CONFIRMED,
    confirmedVisitAt: null,
    preferredVisitAt: null,
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
