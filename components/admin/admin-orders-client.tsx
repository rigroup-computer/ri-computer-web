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
import type { OrdersStatusTab } from "@/lib/admin-order-status-display";

export type { AdminSerializedOrder } from "@/components/admin/orders/order-row-data";

type AdminOrdersClientProps = Readonly<{
  orders: AdminSerializedOrder[];
  emptyMessage: string;
  activeTab: OrdersStatusTab;
  jenis?: string;
  hasServiceTypeFilter: boolean;
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
  jenis,
  hasServiceTypeFilter,
}: AdminOrdersClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
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
    () => filterOrdersBySearch(orders, searchQuery),
    [orders, searchQuery],
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

  const handleRowClick = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const searchEmptyMessage =
    searchQuery.trim() && rowData.length === 0
      ? "Tidak ada pesanan yang cocok dengan pencarian."
      : emptyMessage;

  return (
    <>
      <OrdersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        jenis={jenis}
        hasServiceTypeFilter={hasServiceTypeFilter}
      />

      <OrdersList
        orders={rowData}
        emptyMessage={searchEmptyMessage}
        selectedId={selectedId}
        onRowClick={handleRowClick}
      />

      <div className="hidden lg:grid lg:grid-cols-1 lg:gap-6">
        <OrdersTable
          orders={rowData}
          emptyMessage={searchEmptyMessage}
          selectedId={selectedId}
          onRowClick={handleRowClick}
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
