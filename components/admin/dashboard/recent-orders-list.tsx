import Link from "next/link";

import { OrderListRow } from "@/components/admin/orders/order-list-row";
import { toOrderListRowDataFromDashboard } from "@/components/admin/orders/order-row-data";
import type { AdminDashboardRecentOrder } from "@/src/lib/sdk/orders";

type RecentOrdersListProps = Readonly<{
  orders: AdminDashboardRecentOrder[];
}>;

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  return (
    <section
      aria-labelledby="recent-orders-mobile-heading"
      className="lg:hidden"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2
          id="recent-orders-mobile-heading"
          className="text-lg font-bold text-mate-black"
        >
          Pesanan Terbaru
        </h2>
        <Link
          href="/admin/orders"
          className="text-sm font-semibold text-[#1a73e8]"
        >
          Lihat Semua
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-mate-black/55">
          Belum ada pesanan servis.
        </p>
      ) : (
        <div className="overflow-hidden rounded-t-2xl bg-white custom-shadow-sm">
          <ul>
            {orders.map((order, index) => (
              <OrderListRow
                key={order.id}
                order={toOrderListRowDataFromDashboard(order)}
                isLast={index === orders.length - 1}
                href="/admin/orders"
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
