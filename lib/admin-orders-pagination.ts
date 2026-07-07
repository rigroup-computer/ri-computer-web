export const ADMIN_ORDERS_PAGE_SIZE_OPTIONS = [5, 10, 15] as const;

export type AdminOrdersPageSize =
  (typeof ADMIN_ORDERS_PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_ADMIN_ORDERS_PAGE_SIZE: AdminOrdersPageSize = 10;

export type AdminOrdersPaginationMeta = Readonly<{
  page: number;
  pageSize: AdminOrdersPageSize;
  total: number;
  pageCount: number;
  safePage: number;
  rangeStart: number;
  rangeEnd: number;
}>;

export function isAdminOrdersPageSize(
  value: number,
): value is AdminOrdersPageSize {
  return ADMIN_ORDERS_PAGE_SIZE_OPTIONS.includes(value as AdminOrdersPageSize);
}

export function paginateItems<T>(
  items: readonly T[],
  page: number,
  pageSize: AdminOrdersPageSize,
): Readonly<{ items: T[]; meta: AdminOrdersPaginationMeta }> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  const pagedItems = items.slice(start, start + pageSize);

  return {
    items: pagedItems,
    meta: {
      page,
      pageSize,
      total,
      pageCount,
      safePage,
      rangeStart: total === 0 ? 0 : start + 1,
      rangeEnd: start + pagedItems.length,
    },
  };
}
