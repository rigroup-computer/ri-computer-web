import type { Prisma } from "@prisma/client";

import { AdminOrdersClient } from "@/components/admin/admin-orders-client";
import type { AdminSerializedOrder } from "@/components/admin/orders/order-row-data";
import { OrdersPageHeader } from "@/components/admin/orders/orders-page-header";
import { resolveOrderUpdatedAt } from "@/components/admin/orders/order-row-data";
import {
  ordersStatusTabFromQuery,
  serviceTypeFromJenisQuery,
  statusWhereForOrdersTab,
} from "@/lib/admin-order-status-display";
import { normalizeStoredIssueAttachmentUrls } from "@/lib/booking-issue-attachments";
import { parseStoredCostLineItems } from "@/lib/service-order-cost-items";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  jenis?: string;
  tab?: string;
}>;

async function fetchOrdersWithTimelines(where: Prisma.ServiceOrderWhereInput) {
  return prisma.serviceOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      timelines: { orderBy: { createdAt: "desc" } },
    },
  });
}

export type AdminOrderQueryRow =
  Awaited<ReturnType<typeof fetchOrdersWithTimelines>>[number];

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
  const serviceTypeFilter = serviceTypeFromJenisQuery(
    typeof params?.jenis === "string" ? params.jenis : undefined,
  );

  const tabStatusWhere = statusWhereForOrdersTab(activeTab);
  const where: Prisma.ServiceOrderWhereInput = serviceTypeFilter
    ? { AND: [tabStatusWhere, { serviceType: serviceTypeFilter }] }
    : tabStatusWhere;

  const orders = await fetchOrdersWithTimelines(where);
  const emptyMessage = EMPTY_MESSAGES[activeTab] ?? EMPTY_MESSAGES.semua;

  return (
    <main className="space-y-3 lg:space-y-5">
      <OrdersPageHeader
        hasServiceTypeFilter={Boolean(serviceTypeFilter)}
        jenisLabel={params?.jenis}
      />

      <AdminOrdersClient
        orders={serializeOrdersForClient(orders)}
        emptyMessage={emptyMessage}
        activeTab={activeTab}
        jenis={params?.jenis}
        hasServiceTypeFilter={Boolean(serviceTypeFilter)}
      />
    </main>
  );
}
