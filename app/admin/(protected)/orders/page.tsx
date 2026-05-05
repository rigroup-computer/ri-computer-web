import Link from "next/link";
import type { Prisma } from "@prisma/client";

import {
  AdminOrdersClient,
  type AdminSerializedOrder,
} from "@/components/admin/admin-orders-client";
import { normalizeStoredIssueAttachmentUrls } from "@/lib/booking-issue-attachments";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ bagian?: string }>;

/** Tipe baris selaras hasil query (hindari drift vs `GetPayload` di beberapa versi Prisma/IDE). */
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
    createdAt: order.createdAt.toISOString(),
    timelines: order.timelines.map((item) => ({
      id: item.id,
      title: item.title,
      note: item.note,
      createdAt: item.createdAt.toISOString(),
    })),
  }));
}

export default async function AdminOrdersPage({
  searchParams,
}: Readonly<{
  searchParams: SearchParams;
}>) {
  const params = await searchParams;
  const bagian =
    typeof params?.bagian === "string" && params.bagian === "selesai"
      ? "selesai"
      : "proses";

  const ordersWhere =
    bagian === "selesai"
      ? { status: "COMPLETED" as const }
      : { NOT: { status: "COMPLETED" as const } };

  const [countProses, countSelesai, orders] = await Promise.all([
    prisma.serviceOrder.count({
      where: { NOT: { status: "COMPLETED" } },
    }),
    prisma.serviceOrder.count({ where: { status: "COMPLETED" } }),
    fetchOrdersWithTimelines(ordersWhere),
  ]);

  const clientOrders = serializeOrdersForClient(orders);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Order Home Service
        </h1>
        <p className="text-sm text-slate-600">
          Pelanggan hanya bisa melihat lewat aplikasi Tracking setelah Anda
          memperbarui status.
        </p>
      </div>

      <nav
        className="flex gap-1 rounded-xl bg-slate-100 p-1 text-sm font-medium"
        aria-label="Filter order servis"
      >
        <Link
          href="/admin/orders?bagian=proses"
          scroll={false}
          className={`min-h-11 flex-1 rounded-lg px-3 py-2.5 text-center transition-colors ${
            bagian === "proses"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 active:bg-white/70"
          }`}
        >
          Dalam proses
          <span className="ml-1 tabular-nums text-slate-400">
            ({countProses})
          </span>
        </Link>
        <Link
          href="/admin/orders?bagian=selesai"
          scroll={false}
          className={`min-h-11 flex-1 rounded-lg px-3 py-2.5 text-center transition-colors ${
            bagian === "selesai"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 active:bg-white/70"
          }`}
        >
          Selesai
          <span className="ml-1 tabular-nums text-slate-400">
            ({countSelesai})
          </span>
        </Link>
      </nav>

      <div className="space-y-4">
        <AdminOrdersClient orders={clientOrders} />

        {orders.length === 0 ? (
          <p className="text-sm text-slate-600">
            {bagian === "selesai"
              ? "Belum ada order dengan status Selesai."
              : "Tidak ada order dalam proses. Semua sedang kosong atau sudah ditandai Selesai."}
          </p>
        ) : null}
      </div>
    </main>
  );
}
