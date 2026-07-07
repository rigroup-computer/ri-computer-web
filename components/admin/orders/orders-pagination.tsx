"use client";

import {
  ADMIN_ORDERS_PAGE_SIZE_OPTIONS,
  isAdminOrdersPageSize,
  type AdminOrdersPageSize,
  type AdminOrdersPaginationMeta,
} from "@/lib/admin-orders-pagination";
import { Icon } from "@iconify/react";

type OrdersPaginationProps = Readonly<{
  meta: AdminOrdersPaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: AdminOrdersPageSize) => void;
  className?: string;
}>;

export function OrdersPagination({
  meta,
  onPageChange,
  onPageSizeChange,
  className,
}: OrdersPaginationProps) {
  const { safePage, pageCount, total, rangeStart, rangeEnd, pageSize } = meta;

  if (total === 0) {
    return null;
  }

  const canGoPrev = safePage > 1;
  const canGoNext = safePage < pageCount;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 text-sm text-[#565d6d] ${className ?? ""}`}
    >
      <div className="flex flex-wrap mx-auto lg:mx-0 items-center gap-3">
        <p>
          Menampilkan {rangeStart}-{rangeEnd} dari {total} pesanan
        </p>
      </div>
      <div className="flex w-full flex-wrap items-center gap-3 justify-between lg:w-auto lg:justify-start">
        <label className="inline-flex items-center gap-2">
          <span className="shrink-0">Per halaman:</span>
          <span className="relative inline-flex size-7 shrink-0 lg:size-auto">
            <select
              value={pageSize}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (isAdminOrdersPageSize(next)) {
                  onPageSizeChange(next);
                }
              }}
              className="size-full appearance-none rounded-md border border-[#dee1e6] bg-white px-0.5 text-center text-[10px] leading-none font-medium text-[#171a1f] lg:size-auto lg:appearance-auto lg:min-h-0 lg:p-1.5 lg:text-sm"
              aria-label="Jumlah pesanan per halaman"
            >
              {ADMIN_ORDERS_PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => onPageChange(safePage - 1)}
            className="aspect-square rounded-md border border-[#dee1e6] p-1 lg:p-1.5 text-sm font-medium text-[#171a1f] disabled:cursor-not-allowed disabled:opacity-50 lg:min-h-0"
          >
            <Icon
              icon="material-symbols:chevron-left-rounded"
              width={18}
              height={18}
              aria-hidden
            />
          </button>
          <span
            className="inline-flex aspect-square min-w-8 items-center justify-center rounded-md bg-[#1a73e8] px-1 lg:px-2 text-sm font-medium text-white lg:min-h-8"
            aria-current="page"
          >
            {safePage}
          </span>
          <span className="text-xs text-[#565d6d]">/ {pageCount}</span>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => onPageChange(safePage + 1)}
            className="aspect-square rounded-md border border-[#dee1e6] p-1 lg:p-1.5 text-sm font-medium text-[#171a1f] disabled:cursor-not-allowed disabled:opacity-50 lg:min-h-0"
          >
            <Icon
              icon="material-symbols:chevron-right-rounded"
              width={18}
              height={18}
              aria-hidden
            />
          </button>
        </div>
      </div>
    </div>
  );
}
