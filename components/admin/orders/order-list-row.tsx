import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";

import {
  adminStatusBucketLabel,
  adminStatusDashboardBadgeClassName,
  adminStatusOrdersPageBadgeClassName,
  adminStatusOrdersPageBadgeSpriteClass,
} from "@/lib/admin-order-status-display";
import {
  formatOrderDateId,
  formatRelativeTimeShort,
} from "@/lib/format-relative-time";

import {
  formatOrderDeviceLabel,
  ORDER_DEVICE_EMPTY_LIST,
  orderRowAriaLabel,
  type OrderListRowData,
} from "./order-row-data";
import "./order-process-icon.css";

type OrderListRowProps = Readonly<{
  order: OrderListRowData;
  isLast?: boolean;
  variant?: "dashboard" | "orders";
  onClick?: () => void;
  href?: string;
}>;

function DashboardRowContent({
  order,
}: Readonly<{
  order: OrderListRowData;
}>) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-[#1a73e8]">
            #{order.trackingId}
          </span>
          <span className={adminStatusDashboardBadgeClassName(order.bucket)}>
            {adminStatusBucketLabel(order.bucket)}
          </span>
        </div>
        <p className="mt-1 truncate text-sm font-semibold text-mate-black">
          {order.customerName}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#565d6d]">
          <div className="relative size-4">
            <Image src="/icons/ic-package.svg" alt="Package" fill />
          </div>
          <span className="truncate">
            {formatOrderDeviceLabel(order, ORDER_DEVICE_EMPTY_LIST)}
          </span>
          <span className="text-[#dedfe3]" aria-hidden>
            ·
          </span>
          <span className="shrink-0 tabular-nums">
            {formatRelativeTimeShort(order.updatedAt)}
          </span>
        </p>
      </div>
      <Icon
        icon="mdi:chevron-right"
        width={22}
        height={22}
        className="shrink-0 text-[#c4c8cf]"
        aria-hidden
      />
    </>
  );
}

function OrdersPageRowContent({
  order,
}: Readonly<{
  order: OrderListRowData;
}>) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="min-w-0 max-w-32 shrink truncate text-xs font-bold tracking-wide text-[#1a73e8]">
              {order.trackingId}
            </span>
            <span className={adminStatusOrdersPageBadgeClassName(order.bucket)}>
              <span
                aria-hidden
                className={`icon-process ${adminStatusOrdersPageBadgeSpriteClass(order.bucket)}`}
              />
              {adminStatusBucketLabel(order.bucket)}
            </span>
          </div>
          <span className="shrink-0 text-[10px] font-medium text-[#565d6d]">
            {formatOrderDateId(order.createdAt)}
          </span>
        </div>
        <p className="mt-1 truncate text-base capitalize font-semibold text-[#171a1f]">
          {order.customerName}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#565d6d]">
          <div className="relative size-4">
            <Image src="/icons/ic-package.svg" alt="Package" fill />
          </div>
          <span className="truncate">
            {formatOrderDeviceLabel(order, ORDER_DEVICE_EMPTY_LIST)}
          </span>
        </p>
      </div>
      <Icon
        icon="mdi:chevron-right"
        width={18}
        height={18}
        className="shrink-0 self-center text-[#565d6d]/50"
        aria-hidden
      />
    </>
  );
}

export function OrderListRow({
  order,
  isLast = false,
  variant = "dashboard",
  onClick,
  href,
}: OrderListRowProps) {
  const rowClassName = `flex w-full items-center gap-3 px-4 active:bg-slate-50 ${
    variant === "orders" ? "min-h-[101px] py-4" : "min-h-11 py-3.5"
  }`;

  const borderClass = isLast ? undefined : "border-b border-[#dee1e6]";
  const content =
    variant === "orders" ? (
      <OrdersPageRowContent order={order} />
    ) : (
      <DashboardRowContent order={order} />
    );

  if (href) {
    return (
      <li className={borderClass}>
        <Link
          href={href}
          className={rowClassName}
          aria-label={orderRowAriaLabel(order)}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li className={borderClass}>
      <button
        type="button"
        onClick={onClick}
        aria-label={orderRowAriaLabel(order)}
        className={`text-left ${rowClassName}`}
      >
        {content}
      </button>
    </li>
  );
}
