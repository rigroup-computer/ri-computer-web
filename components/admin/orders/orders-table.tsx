import type { KeyboardEvent } from "react";

import { VisitScheduleStatus } from "@prisma/client";
import { Icon } from "@iconify/react";

import {
  adminStatusBucketLabel,
  adminStatusOrdersPageBadgeClassName,
  adminStatusOrdersPageBadgeSpriteClass,
  serviceTypeAdminLabel,
} from "@/lib/admin-order-status-display";
import {
  isScheduleAwaitingCustomer,
  isSchedulePendingAdminAction,
  visitScheduleTableLabel,
} from "@/lib/admin-visit-schedule-gate";
import { formatOrderDateTimeId } from "@/lib/format-relative-time";

import {
  formatOrderDeviceLabel,
  orderRowAriaLabel,
  type OrderListRowData,
} from "./order-row-data";
import { OrderVisitScheduleBadge } from "./order-visit-schedule-badge";
import { OrdersTableSort } from "./orders-table-sort";
import { OrdersPagination } from "./orders-pagination";
import type { AdminOrdersSortKey } from "@/lib/admin-orders-sort";
import type {
  AdminOrdersPageSize,
  AdminOrdersPaginationMeta,
} from "@/lib/admin-orders-pagination";
import "./order-process-icon.css";

type OrdersTableProps = Readonly<{
  orders: OrderListRowData[];
  totalCount: number;
  emptyMessage: string;
  selectedId: string | null;
  onRowClick: (id: string) => void;
  sortKey: AdminOrdersSortKey;
  onSortChange: (sortKey: AdminOrdersSortKey) => void;
  paginationMeta: AdminOrdersPaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: AdminOrdersPageSize) => void;
}>;

function handleRowKeyDown(
  event: KeyboardEvent<HTMLTableRowElement>,
  onActivate: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onActivate();
  }
}

function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

export function OrdersTable({
  orders,
  totalCount,
  emptyMessage,
  selectedId,
  onRowClick,
  sortKey,
  onSortChange,
  paginationMeta,
  onPageChange,
  onPageSizeChange,
}: OrdersTableProps) {
  return (
    <section
      className="hidden overflow-hidden rounded-2xl border border-[#dee1e6] bg-white shadow-[0_1px_2.19px_0_rgba(23,26,31,0.07),0_0_1.75px_0_rgba(23,26,31,0.08)] lg:block"
      aria-label="Daftar pesanan servis"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dee1e6] px-6 py-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-[#171a1f]">Daftar Pesanan</h2>
          {totalCount > 0 ? (
            <span className="rounded-[11px] bg-[#f3f4f6] px-2.5 py-0.5 text-xs text-[#565d6d]">
              {totalCount} Pesanan
            </span>
          ) : null}
        </div>
        <OrdersTableSort sortKey={sortKey} onSortChange={onSortChange} />
      </div>

      {orders.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-[#565d6d]">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#dee1e6] bg-[#f3f4f6]/30 text-sm font-semibold text-[#565d6d]">
                <th scope="col" className="px-4 py-4">
                  ID PESANAN
                </th>
                <th scope="col" className="px-4 py-4">
                  CUSTOMER
                </th>
                <th scope="col" className="px-4 py-4">
                  UNIT
                </th>
                <th scope="col" className="px-4 py-4">
                  TIPE LAYANAN
                </th>
                <th scope="col" className="px-4 py-4">
                  STATUS
                </th>
                <th scope="col" className="px-4 py-4">
                  JADWAL
                </th>
                <th scope="col" className="px-4 py-4">
                  UPDATE TERAKHIR
                </th>
                {/* <th scope="col" className="px-4 py-4 text-right">
                  AKSI
                </th> */}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isSelected = selectedId === order.id;
                const isPendingAdminAction = isSchedulePendingAdminAction(order);
                const isAwaitingCustomer = isScheduleAwaitingCustomer(order);
                const activate = () => onRowClick(order.id);

                return (
                  <tr
                    key={order.id}
                    tabIndex={0}
                    aria-selected={isSelected}
                    aria-label={orderRowAriaLabel(order)}
                    onClick={activate}
                    onKeyDown={(event) => handleRowKeyDown(event, activate)}
                    className={`cursor-pointer border-b border-[#dee1e6] last:border-0 focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-[#1a73e8] ${
                      isPendingAdminAction
                        ? "border-l-4 border-l-amber-400"
                        : isAwaitingCustomer
                          ? "border-l-4 border-l-[#60a5fa]"
                          : ""
                    } ${
                      isSelected ? "bg-[#f1f6fe]" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="px-4 py-5 font-medium text-[#1a73e8]">
                      <div className="flex items-center gap-1.5">
                        <span>{order.trackingId}</span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void navigator.clipboard.writeText(order.trackingId);
                          }}
                          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[#1a73e8] hover:bg-[#1a73e8]/10"
                          aria-label={`Salin ID ${order.trackingId}`}
                        >
                          <Icon
                            icon="solar:copy-bold"
                            width={16}
                            height={16}
                            aria-hidden
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e5f7fb] text-xs font-semibold text-[#171a1f]"
                          aria-hidden
                        >
                          {customerInitials(order.customerName)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#171a1f]">
                            {order.customerName}
                          </p>
                          <p className="truncate text-xs text-[#565d6d]">
                            {order.customerPhone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[#171a1f]/80">
                      {formatOrderDeviceLabel(order)}
                    </td>
                    <td className="px-4 py-5">
                      <span className="inline-flex max-w-[140px] truncate rounded-[10px] bg-[#f6f7f9] px-2.5 py-0.5 text-xs text-[#19191f]">
                        {serviceTypeAdminLabel(order.serviceType)}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span className={adminStatusOrdersPageBadgeClassName(order.bucket)}>
                        <span
                          aria-hidden
                          className={`icon-process ${adminStatusOrdersPageBadgeSpriteClass(order.bucket)}`}
                        />
                        {adminStatusBucketLabel(order.bucket)}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex max-w-[200px] flex-col items-start gap-1">
                        {order.visitScheduleStatus ===
                          VisitScheduleStatus.CONFIRMED ||
                        order.visitScheduleStatus ===
                          VisitScheduleStatus.RESCHEDULED ? (
                          <OrderVisitScheduleBadge
                            visitScheduleStatus={order.visitScheduleStatus}
                            confirmedVisitAt={order.confirmedVisitAt}
                            preferredVisitAt={order.preferredVisitAt}
                            bucket={order.bucket}
                          />
                        ) : (
                          <>
                            <span className="text-xs leading-snug text-[#171a1f]/80">
                              {visitScheduleTableLabel(order)}
                            </span>
                            <OrderVisitScheduleBadge
                              visitScheduleStatus={order.visitScheduleStatus}
                              confirmedVisitAt={order.confirmedVisitAt}
                              preferredVisitAt={order.preferredVisitAt}
                              bucket={order.bucket}
                            />
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[#565d6d]">
                      {formatOrderDateTimeId(order.updatedAt)}
                    </td>
                    {/* <td className="px-4 py-5 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          activate();
                        }}
                        className="inline-flex size-8 items-center justify-center rounded-md text-[#565d6d] hover:bg-slate-100"
                        aria-label={`Lihat detail ${order.trackingId}`}
                      >
                        <Icon icon="mdi:chevron-right" width={18} height={18} aria-hidden />
                      </button>
                    </td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalCount > 0 ? (
        <div className="border-t border-[#dee1e6] bg-[#f3f4f6]/10 px-6 py-4">
          <OrdersPagination
            meta={paginationMeta}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      ) : null}
    </section>
  );
}
