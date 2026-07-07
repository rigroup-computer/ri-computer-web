"use client";

import type { TransitionEvent } from "react";

import { Icon } from "@iconify/react";

import { OrderDetailBody } from "./order-detail-body";
import type { AdminSerializedOrder } from "./order-row-data";

import {
  isScheduleGateActive,
  scheduleGateHeaderSubtitle,
} from "@/lib/admin-visit-schedule-gate";

type OrderDetailPanelProps = Readonly<{
  order: AdminSerializedOrder;
  slideIn?: boolean;
  onRequestClose: () => void;
  onTransitionEnd?: (event: TransitionEvent<HTMLElement>) => void;
  onAfterStatusChange: () => void;
  onRefreshAfterAction: (action: () => Promise<void>) => Promise<void>;
}>;

function DetailHeader({
  order,
  onRequestClose,
}: Readonly<{
  order: AdminSerializedOrder;
  onRequestClose: () => void;
}>) {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-[#dee1e6] px-2 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:px-4 lg:py-3.5 lg:pt-3.5">
      <button
        type="button"
        onClick={onRequestClose}
        className="flex size-11 touch-manipulation items-center justify-center rounded-full text-[#171a1f] active:bg-[#f7f7f8] lg:size-9"
        aria-label="Tutup detail"
      >
        <Icon icon="mdi:chevron-left" width={26} height={26} aria-hidden />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-base text-[#171a1f]">
          Detail <span className="font-mono font-semibold"> {order.trackingId}</span>
        </p>
        {isScheduleGateActive(order) ? (
          <p className="text-xs text-[#565d6d]">
            {scheduleGateHeaderSubtitle(order)}
          </p>
        ) : null}
      </div>
    </header>
  );
}

export function OrderDetailPanel({
  order,
  slideIn = true,
  onRequestClose,
  onTransitionEnd,
  onAfterStatusChange,
  onRefreshAfterAction,
}: OrderDetailPanelProps) {
  return (
    <div
      className={`fixed inset-0 z-[60] ${slideIn ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="admin-order-detail-title"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          slideIn
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-label="Tutup detail"
        tabIndex={slideIn ? 0 : -1}
        onClick={onRequestClose}
      />

      <aside
        className={`absolute inset-y-0 right-0 flex h-dvh w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:max-w-[28rem] ${
          slideIn
            ? "translate-x-0 pointer-events-auto"
            : "translate-x-full pointer-events-none"
        }`}
        onTransitionEnd={onTransitionEnd}
      >
        <DetailHeader order={order} onRequestClose={onRequestClose} />
        <div
          id="order-detail-scroll"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <OrderDetailBody
            order={order}
            onAfterStatusChange={onAfterStatusChange}
            onRefreshAfterAction={onRefreshAfterAction}
          />
        </div>
        <div id="order-detail-footer" className="shrink-0" />
      </aside>
    </div>
  );
}
