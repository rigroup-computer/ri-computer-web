"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import { useRouter } from "next/navigation";

import { OrderDetailPanel } from "@/components/admin/orders/order-detail-panel";
import { OrdersList } from "@/components/admin/orders/orders-list";
import {
  toOrderListRowDataFromSerialized,
  type AdminSerializedOrder,
} from "@/components/admin/orders/order-row-data";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { OrdersToolbar } from "@/components/admin/orders/orders-toolbar";
import { OrdersPagination } from "@/components/admin/orders/orders-pagination";
import type { JenisQueryValue, OrdersStatusTab } from "@/lib/admin-order-status-display";
import {
  DEFAULT_ADMIN_ORDERS_SORT,
  sortOrderListRows,
  type AdminOrdersSortKey,
} from "@/lib/admin-orders-sort";
import {
  DEFAULT_ADMIN_ORDERS_PAGE_SIZE,
  paginateItems,
  type AdminOrdersPageSize,
} from "@/lib/admin-orders-pagination";

export type { AdminSerializedOrder } from "@/components/admin/orders/order-row-data";

type AdminOrdersClientProps = Readonly<{
  orders: AdminSerializedOrder[];
  emptyMessage: string;
  activeTab: OrdersStatusTab;
  selectedJenis: JenisQueryValue[];
}>;

const PANEL_CLOSE_MS = 320;

function filterOrdersBySearch(
  orders: AdminSerializedOrder[],
  query: string,
): AdminSerializedOrder[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return orders;
  }
  return orders.filter(
    (order) =>
      order.trackingId.toLowerCase().includes(normalized) ||
      order.customerName.toLowerCase().includes(normalized),
  );
}

export function AdminOrdersClient({
  orders,
  emptyMessage,
  activeTab,
  selectedJenis,
}: AdminOrdersClientProps) {
  const router = useRouter();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<AdminOrdersSortKey>(
    DEFAULT_ADMIN_ORDERS_SORT,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<AdminOrdersPageSize>(
    DEFAULT_ADMIN_ORDERS_PAGE_SIZE,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [slideIn, setSlideIn] = useState(false);
  const slideInRef = useRef(false);
  useLayoutEffect(() => {
    slideInRef.current = slideIn;
  }, [slideIn]);
  const closeFallbackRef = useRef<number | null>(null);

  const clearCloseFallback = useCallback(() => {
    if (closeFallbackRef.current !== null) {
      clearTimeout(closeFallbackRef.current);
      closeFallbackRef.current = null;
    }
  }, []);

  const filteredOrders = useMemo(
    () => filterOrdersBySearch(orders, debouncedSearchQuery),
    [orders, debouncedSearchQuery],
  );

  const selectedOrder = useMemo(
    () => filteredOrders.find((o) => o.id === selectedId) ?? null,
    [filteredOrders, selectedId],
  );

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    clearCloseFallback();
    if (!filteredOrders.some((o) => o.id === selectedId)) {
      queueMicrotask(() => {
        setSelectedId(null);
        setSlideIn(false);
      });
      return;
    }

    queueMicrotask(() => {
      setSlideIn(false);
    });
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => setSlideIn(true));
    });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      document.body.style.overflow = prevOverflow;
    };
  }, [clearCloseFallback, filteredOrders, selectedId]);

  useEffect(() => () => clearCloseFallback(), [clearCloseFallback]);

  const finishClose = useCallback(() => {
    clearCloseFallback();
    setSelectedId(null);
  }, [clearCloseFallback]);

  const requestClose = useCallback(() => {
    setSlideIn(false);
    clearCloseFallback();
    closeFallbackRef.current = globalThis.window.setTimeout(() => {
      closeFallbackRef.current = null;
      finishClose();
    }, PANEL_CLOSE_MS);
  }, [clearCloseFallback, finishClose]);

  const onPanelTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget) {
        return;
      }
      if (event.propertyName !== "transform") {
        return;
      }
      if (slideInRef.current) {
        return;
      }
      finishClose();
    },
    [finishClose],
  );

  const refreshAfterAction = useCallback(async (action: () => Promise<void>) => {
    await action();
    router.refresh();
  }, [router]);

  const rowData = useMemo(
    () => filteredOrders.map(toOrderListRowDataFromSerialized),
    [filteredOrders],
  );

  const sortedRowData = useMemo(
    () => sortOrderListRows(rowData, sortKey),
    [rowData, sortKey],
  );

  const { items: pagedRows, meta: paginationMeta } = useMemo(
    () => paginateItems(sortedRowData, page, pageSize),
    [sortedRowData, page, pageSize],
  );

  const handleSearchChange = useCallback((value: string) => {
    setDebouncedSearchQuery(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((nextSortKey: AdminOrdersSortKey) => {
    setSortKey(nextSortKey);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const handlePageSizeChange = useCallback((nextPageSize: AdminOrdersPageSize) => {
    setPageSize(nextPageSize);
    setPage(1);
  }, []);

  const handleRowClick = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const searchEmptyMessage =
    debouncedSearchQuery.trim() && sortedRowData.length === 0
      ? "Tidak ada pesanan yang cocok dengan pencarian."
      : emptyMessage;

  return (
    <>
      <OrdersToolbar
        onDebouncedSearchChange={handleSearchChange}
        activeTab={activeTab}
        selectedJenis={selectedJenis}
      />

      <OrdersList
        orders={pagedRows}
        emptyMessage={searchEmptyMessage}
        selectedId={selectedId}
        onRowClick={handleRowClick}
      />

      {paginationMeta.total > 0 ? (
        <div className="-mx-4 border-t border-[#dee1e6] bg-white px-4 py-4 lg:hidden">
          <OrdersPagination
            meta={paginationMeta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      ) : null}

      <div className="hidden lg:grid lg:grid-cols-1 lg:gap-6">
        <OrdersTable
          orders={pagedRows}
          totalCount={paginationMeta.total}
          emptyMessage={searchEmptyMessage}
          selectedId={selectedId}
          onRowClick={handleRowClick}
          sortKey={sortKey}
          onSortChange={handleSortChange}
          paginationMeta={paginationMeta}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {selectedOrder ? (
        <OrderDetailPanel
          order={selectedOrder}
          slideIn={slideIn}
          onRequestClose={requestClose}
          onTransitionEnd={onPanelTransitionEnd}
          onAfterStatusChange={() => router.refresh()}
          onRefreshAfterAction={refreshAfterAction}
        />
      ) : null}
    </>
  );
}
