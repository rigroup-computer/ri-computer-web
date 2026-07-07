import { Icon } from "@iconify/react";
import Link from "next/link";

import {
  adminStatusBucketLabel,
  adminStatusBucketTableClassName,
  formatTrackingIdDisplay,
} from "@/lib/admin-order-status-display";
import type { AdminDashboardRecentOrder } from "@/src/lib/sdk/orders";
import { formatRelativeTime } from "@/lib/format-relative-time";

type RecentOrdersTableProps = Readonly<{
  orders: AdminDashboardRecentOrder[];
}>;

function deviceLabel(order: AdminDashboardRecentOrder): string {
  const parts = [order.laptopBrand, order.laptopModel].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "—";
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const rows = orders.slice(0, 5);

  return (
    <section
      className="hidden overflow-hidden rounded-[10px] bg-white custom-shadow-sm lg:block"
      aria-labelledby="recent-orders-heading"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#dee1e6] px-5 py-4">
        <div>
          <h2
            id="recent-orders-heading"
            className="text-base font-bold text-[#171a1f]"
          >
            Pesanan Terbaru
          </h2>
          <p className="mt-0.5 text-sm text-[#565d6d]">
            Daftar 5 aktivitas pesanan terakhir
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#1a73e8] hover:text-primary-dark"
        >
          Lihat Semua
          <Icon icon="mdi:arrow-right" width={16} height={16} aria-hidden />
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[#565d6d]">
          Belum ada pesanan servis.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#dee1e6] bg-[#f7f7f8]/80 text-2xs font-semibold uppercase tracking-wide text-[#565d6d]">
                <th scope="col" className="px-5 py-3">
                  ID Pesanan
                </th>
                <th scope="col" className="px-5 py-3">
                  Pelanggan
                </th>
                <th scope="col" className="px-5 py-3">
                  Unit Laptop
                </th>
                <th scope="col" className="px-5 py-3">
                  Status
                </th>
                <th scope="col" className="px-5 py-3">
                  Terakhir Diperbarui
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#dee1e6]/60 last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-5 py-3.5 text-xs font-bold text-[#1a73e8]">
                    {formatTrackingIdDisplay(order.trackingId)}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[#171a1f]">
                    {order.customerName}
                  </td>
                  <td className="px-5 py-3.5 text-[#565d6d]">
                    {deviceLabel(order)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={adminStatusBucketTableClassName(order.bucket)}
                    >
                      {adminStatusBucketLabel(order.bucket)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#565d6d]">
                    {formatRelativeTime(order.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
