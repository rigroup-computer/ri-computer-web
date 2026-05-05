"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import type { ServiceStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { AdminOrderStatusSheet } from "@/components/admin/admin-order-status-sheet";
import { SvgChevronLeft, SvgChevronRight } from "@/components/shared/SvgComponent";
import { appendServiceTimelineNote } from "@/lib/actions/admin-orders";
import { serviceStatusLabel } from "@/lib/service-status-label";

export type AdminSerializedOrder = {
  id: string;
  trackingId: string;
  customerName: string;
  customerPhone: string;
  laptopBrand: string | null;
  laptopModel: string | null;
  issue: string;
  attachmentUrls: string[];
  visitAddress: string;
  preferredVisitAt: string | null;
  status: ServiceStatus;
  createdAt: string;
  timelines: Array<{
    id: string;
    title: string;
    note: string | null;
    createdAt: string;
  }>;
};

type AdminOrdersClientProps = Readonly<{
  orders: AdminSerializedOrder[];
}>;

const PANEL_CLOSE_MS = 320;

export function AdminOrdersClient({ orders }: AdminOrdersClientProps) {
  const router = useRouter();
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

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  );

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    clearCloseFallback();
    if (!orders.some((o) => o.id === selectedId)) {
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
  }, [clearCloseFallback, orders, selectedId]);

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

  return (
    <>
      <div className="space-y-2">
        {orders.map((order) => (
          <button
            key={order.id}
            type="button"
            onClick={() => setSelectedId(order.id)}
            className="flex w-full touch-manipulation items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm active:bg-slate-50"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {order.customerName}
                </p>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {serviceStatusLabel(order.status)}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                {order.trackingId}
              </p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                {order.issue}
              </p>
            </div>
            <SvgChevronRight className="size-5 shrink-0 text-slate-400" />
          </button>
        ))}
      </div>

      {selectedOrder ? (
        <div
          className={`fixed inset-0 z-[60] ${slideIn ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-modal="true"
          role="dialog"
          aria-labelledby="admin-order-detail-title"
        >
          <button
            type="button"
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              slideIn
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            aria-label="Tutup detail"
            tabIndex={slideIn ? 0 : -1}
            onClick={requestClose}
          />

          <aside
            className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              slideIn
                ? "translate-x-0 pointer-events-auto"
                : "translate-x-full pointer-events-none"
            }`}
            onTransitionEnd={onPanelTransitionEnd}
          >
            <header className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-2 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <button
                type="button"
                onClick={requestClose}
                className="flex size-11 touch-manipulation items-center justify-center rounded-full text-slate-800 active:bg-slate-100"
                aria-label="Kembali"
              >
                <SvgChevronLeft className="size-6" />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  id="admin-order-detail-title"
                  className="truncate text-sm font-semibold text-slate-900"
                >
                  {selectedOrder.customerName}
                </p>
                <p className="font-mono text-xs text-slate-500">
                  {selectedOrder.trackingId}
                </p>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedOrder.customerPhone}
                  </p>
                </div>
                <span className="h-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {selectedOrder.trackingId}
                </span>
              </div>

              {(selectedOrder.laptopBrand ?? selectedOrder.laptopModel) ? (
                <p className="mt-2 text-xs text-slate-600">
                  Perangkat:{" "}
                  {[selectedOrder.laptopBrand, selectedOrder.laptopModel]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-slate-800">
                {selectedOrder.issue}
              </p>

              {selectedOrder.attachmentUrls.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Lampiran keluhan
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedOrder.attachmentUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative block size-20 overflow-hidden rounded-lg border border-slate-200"
                      >
                        <Image
                          src={url}
                          alt="Lampiran"
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedOrder.visitAddress ? (
                <p className="mt-1 text-xs text-slate-600">
                  Alamat: {selectedOrder.visitAddress}
                </p>
              ) : null}
              {selectedOrder.preferredVisitAt ? (
                <p className="text-xs text-slate-600">
                  Preferensi waktu:{" "}
                  {new Date(
                    selectedOrder.preferredVisitAt,
                  ).toLocaleString("id-ID")}
                </p>
              ) : null}

              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Perbarui status
                </label>
                <AdminOrderStatusSheet
                  orderId={selectedOrder.id}
                  currentStatus={selectedOrder.status}
                  onAfterStatusChange={() => router.refresh()}
                />
                <p className="mt-2 text-xs text-slate-500">
                  Status di lacak pelanggan:{" "}
                  <span className="font-medium text-slate-700">
                    {serviceStatusLabel(selectedOrder.status)}
                  </span>
                  {" — "}
                  mengubah ke &quot;Selesai&quot; memindahkan order ke tab
                  Selesai.
                </p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Timeline pelanggan
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {selectedOrder.timelines.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                    >
                      <div className="flex justify-between gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-900">
                          {item.title}
                        </span>
                        <span>
                          {new Date(item.createdAt).toLocaleString("id-ID")}
                        </span>
                      </div>
                      {item.note ? (
                        <p className="mt-1 text-xs text-slate-600">
                          {item.note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>

                <form
                  action={(formData) =>
                    refreshAfterAction(() =>
                      appendServiceTimelineNote(formData),
                    )
                  }
                  className="mt-4 grid gap-2"
                >
                  <input
                    type="hidden"
                    name="orderId"
                    value={selectedOrder.id}
                  />
                  <input
                    name="title"
                    required
                    className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                    placeholder="Judul pembaruan"
                  />
                  <textarea
                    name="note"
                    className="min-h-16 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Detail (opsional)"
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-lg border border-slate-300 text-sm font-semibold"
                  >
                    Tambahkan catatan
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
