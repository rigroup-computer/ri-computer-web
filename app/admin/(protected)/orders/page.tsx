import type { Prisma } from "@prisma/client";

import { AdminOrdersClient } from "@/components/admin/admin-orders-client";
import type { AdminSerializedOrder } from "@/components/admin/orders/order-row-data";
import { OrdersPageHeader } from "@/components/admin/orders/orders-page-header";
import { resolveOrderUpdatedAt } from "@/components/admin/orders/order-row-data";
import {
  jenisValuesFromQuery,
  ordersStatusTabFromQuery,
  serviceTypesFromJenisQuery,
  statusWhereForOrdersTab,
} from "@/lib/admin-order-status-display";
import { normalizeStoredIssueAttachmentUrls } from "@/lib/booking-issue-attachments";
import { parseStoredCostLineItems } from "@/lib/service-order-cost-items";
import { orderSdk } from "@/src/lib/sdk/orders";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  jenis?: string | string[];
  tab?: string;
}>;

export type AdminOrderQueryRow = Awaited<
  ReturnType<typeof orderSdk.searchAdminOrders>
>[number];

function serializeOrdersForClient(
  orders: AdminOrderQueryRow[],
): AdminSerializedOrder[] {
  return orders.map((order) => ({
    id: order.id,
    trackingId: order.trackingId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    laptopBrand: order.laptopBrand,
    laptopModel: order.laptopModel,
    issue: order.issue,
    attachmentUrls: normalizeStoredIssueAttachmentUrls(
      order.issueAttachmentUrls,
    ),
    visitAddress: order.visitAddress,
    preferredVisitAt: order.preferredVisitAt?.toISOString() ?? null,
    confirmedVisitAt: order.confirmedVisitAt?.toISOString() ?? null,
    visitScheduleStatus: order.visitScheduleStatus,
    visitScheduleNote: order.visitScheduleNote,
    serviceType: order.serviceType,
    status: order.status,
    costConfirmationNote: order.costConfirmationNote,
    costLineItems: parseStoredCostLineItems(order.costLineItems),
    createdAt: order.createdAt.toISOString(),
    updatedAt: resolveOrderUpdatedAt(
      order.updatedAt,
      order.timelines.map((item) => item.createdAt),
    ),
    timelines: order.timelines.map((item) => ({
      id: item.id,
      title: item.title,
      note: item.note,
      createdAt: item.createdAt.toISOString(),
    })),
  }));
}

const EMPTY_MESSAGES: Record<string, string> = {
  semua: "Belum ada pesanan servis.",
  antrian: "Tidak ada pesanan di antrian.",
  proses: "Tidak ada pesanan dalam proses.",
  selesai: "Belum ada pesanan selesai.",
};

export default async function AdminOrdersPage({
  searchParams,
}: Readonly<{
  searchParams: SearchParams;
}>) {
  const params = await searchParams;
  const activeTab = ordersStatusTabFromQuery(params?.tab);
  const selectedJenis = jenisValuesFromQuery(params?.jenis);
  const serviceTypes = serviceTypesFromJenisQuery(params?.jenis);

  const tabStatusWhere = statusWhereForOrdersTab(activeTab);
  const where: Prisma.ServiceOrderWhereInput =
    serviceTypes.length > 0
      ? { AND: [tabStatusWhere, { serviceType: { in: serviceTypes } }] }
      : tabStatusWhere;

  const orders = await orderSdk.searchAdminOrders(where);
  const emptyMessage = EMPTY_MESSAGES[activeTab] ?? EMPTY_MESSAGES.semua;

  return (
    <main className="space-y-3 lg:space-y-5">
      <OrdersPageHeader selectedJenis={selectedJenis} />

      <AdminOrdersClient
        key={`${activeTab}-${selectedJenis.join(",")}`}
        orders={serializeOrdersForClient(orders)}
        emptyMessage={emptyMessage}
        activeTab={activeTab}
        selectedJenis={selectedJenis}
      />
    </main>
  );
}
