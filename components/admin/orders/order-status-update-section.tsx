/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ServiceStatus } from "@prisma/client";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

import {
  deleteCompletedServiceOrder,
  submitServiceOrderStatusUpdate,
} from "@/src/lib/actions/admin-orders";
import { buildCompletionWhatsAppMessage } from "@/lib/admin-completion-whatsapp-message";
import {
  SERVICE_ORDER_STATUS_FLOW,
  getAllowedNextStatuses,
} from "@/lib/service-order-status-transitions";
import { serviceStatusLabel } from "@/lib/service-status-label";
import { whatsappHref } from "@/lib/whatsapp";
import {
  sumCostLineItems,
  type ServiceOrderCostLineItem,
} from "@/lib/service-order-cost-items";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
  OrderCostItemsForm,
  createInitialCostLineItems,
} from "./order-cost-items-form";
import { OrderDetailActionFooter } from "./order-detail-action-footer";
import { OrderActivityTimeline } from "./order-activity-timeline";
import type { AdminSerializedOrder } from "./order-row-data";

export const ORDER_DETAIL_FOOTER_ID = "order-detail-footer";
export const ORDER_DETAIL_SCROLL_ID = "order-detail-scroll";

type OrderStatusUpdateSectionProps = Readonly<{
  order: AdminSerializedOrder;
  onAfterStatusChange: () => void;
  onRefreshAfterAction: (action: () => Promise<void>) => Promise<void>;
  onOrderDeleted: () => void;
}>;

const ADMIN_STEP_LABELS: Record<ServiceStatus, string> = {
  [ServiceStatus.RECEIVED]: "Antrean",
  [ServiceStatus.REPAIRING]: "Proses",
  [ServiceStatus.READY]: "Biaya",
  [ServiceStatus.COMPLETED]: "Selesai",
};

const ADMIN_STEP_ICONS: Record<ServiceStatus, string> = {
  [ServiceStatus.RECEIVED]: "mdi:clock-outline",
  [ServiceStatus.REPAIRING]: "mdi:chip",
  [ServiceStatus.READY]: "mdi:alert-circle-outline",
  [ServiceStatus.COMPLETED]: "mdi:check-circle-outline",
};

function isStepSelectable(
  currentStatus: ServiceStatus,
  step: ServiceStatus,
): boolean {
  if (currentStatus === ServiceStatus.COMPLETED) {
    return false;
  }
  if (step === currentStatus) {
    return true;
  }
  return getAllowedNextStatuses(currentStatus).includes(step);
}

export function OrderStatusUpdateSection({
  order,
  onAfterStatusChange,
  onRefreshAfterAction,
  onOrderDeleted,
}: OrderStatusUpdateSectionProps) {
  const [draftStatus, setDraftStatus] = useState<ServiceStatus | null>(null);
  const [pending, setPending] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lineItems, setLineItems] = useState<ServiceOrderCostLineItem[]>(() =>
    createInitialCostLineItems(order.costLineItems),
  );
  const [technicalNote, setTechnicalNote] = useState(
    order.costConfirmationNote ?? "",
  );

  const isTerminal = order.status === ServiceStatus.COMPLETED;
  const hasDraft = draftStatus !== null && draftStatus !== order.status;
  const showCostForm =
    hasDraft && draftStatus === ServiceStatus.READY;
  const showSimpleConfirm =
    hasDraft && draftStatus !== ServiceStatus.READY;
  const showFooter = showCostForm || showSimpleConfirm || isTerminal;
  const costTotal = sumCostLineItems(
    lineItems.filter((item) => item.name.trim() && item.price > 0),
  );

  const [footerEl, setFooterEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setFooterEl(document.getElementById(ORDER_DETAIL_FOOTER_ID));
  }, []);

  useEffect(() => {
    const scrollEl = document.getElementById(ORDER_DETAIL_SCROLL_ID);
    if (!scrollEl) {
      return;
    }
    scrollEl.classList.toggle("pb-8", showFooter);
    scrollEl.classList.toggle("lg:pb-12", showFooter);
    return () => {
      scrollEl.classList.remove("pb-8", "lg:pb-12");
    };
  }, [showFooter]);

  useEffect(() => {
    setDraftStatus(null);
    setLineItems(createInitialCostLineItems(order.costLineItems));
    setTechnicalNote(order.costConfirmationNote ?? "");
  }, [order.id, order.status, order.costLineItems, order.costConfirmationNote]);

  function handleStepSelect(step: ServiceStatus): void {
    if (!isStepSelectable(order.status, step)) {
      return;
    }
    if (step === order.status) {
      setDraftStatus(null);
      return;
    }
    setDraftStatus(step);
    if (step === ServiceStatus.READY) {
      setLineItems(createInitialCostLineItems(order.costLineItems));
      setTechnicalNote(order.costConfirmationNote ?? "");
    }
  }

  async function submitStatusUpdate(
    targetStatus: ServiceStatus,
    options?: {
      lineItems?: ServiceOrderCostLineItem[];
      costConfirmationNote?: string;
    },
  ): Promise<void> {
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("orderId", order.id);
      fd.set("status", targetStatus);

      if (targetStatus === ServiceStatus.READY && options?.lineItems) {
        const validItems = options.lineItems
          .map((item) => ({
            name: item.name.trim(),
            price: item.price,
          }))
          .filter((item) => item.name.length > 0 && item.price > 0);

        fd.set("lineItems", JSON.stringify(validItems));
        if (options.costConfirmationNote?.trim()) {
          fd.set("costConfirmationNote", options.costConfirmationNote.trim());
        }
      }

      const result = await submitServiceOrderStatusUpdate(fd);
      toast.success("Status diperbarui.");
      setDraftStatus(null);
      onAfterStatusChange();

      if (result.whatsAppMessage) {
        const href = whatsappHref(order.customerPhone, result.whatsAppMessage);
        if (href) {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          toast.error("Nomor WhatsApp pelanggan tidak valid.");
        }
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal memperbarui status.",
      );
    } finally {
      setPending(false);
    }
  }

  function handleCostFormSubmit(): void {
    if (!draftStatus || draftStatus !== ServiceStatus.READY) {
      return;
    }

    const validItems = lineItems
      .map((item) => ({
        name: item.name.trim(),
        price: item.price,
      }))
      .filter((item) => item.name.length > 0 && item.price > 0);

    if (validItems.length === 0) {
      toast.error("Minimal satu item biaya dengan nama dan harga wajib diisi.");
      return;
    }

    void submitStatusUpdate(draftStatus, {
      lineItems: validItems,
      costConfirmationNote: technicalNote,
    });
  }

  function handleSimpleConfirm(): void {
    if (!draftStatus) {
      return;
    }
    void submitStatusUpdate(draftStatus);
  }

  function handleResendCompletionWhatsApp(): void {
    const message = buildCompletionWhatsAppMessage({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      laptopBrand: order.laptopBrand,
      laptopModel: order.laptopModel,
      serviceType: order.serviceType,
      createdAt: new Date(order.createdAt),
      costLineItems: order.costLineItems,
    });
    const href = whatsappHref(order.customerPhone, message);
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    toast.error("Nomor WhatsApp pelanggan tidak valid.");
  }

  async function handleDeleteCompletedOrder(): Promise<void> {
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("orderId", order.id);
      await deleteCompletedServiceOrder(fd);
      toast.success("Order dihapus.");
      setDeleteDialogOpen(false);
      onOrderDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus order.");
    } finally {
      setPending(false);
    }
  }

  const footerVariant = showCostForm
    ? "cost"
    : isTerminal
      ? "resend-completion"
      : "simple";

  return (
    <>
      <div className="px-4 lg:px-5 py-4 bg-white mb-2">
        <div className="mt-3 grid grid-cols-4 gap-2">
          {SERVICE_ORDER_STATUS_FLOW.map((step) => {
            const selectable = isStepSelectable(order.status, step);
            const isSaved = order.status === step;
            const isDraftSelected = draftStatus === step;
            const highlighted = isDraftSelected || (isSaved && !hasDraft);

            return (
              <button
                key={step}
                type="button"
                disabled={!selectable || pending || isTerminal}
                onClick={() => handleStepSelect(step)}
                className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  highlighted
                    ? "border-[#1a73e8] bg-[#eff6ff] text-[#1a73e8]"
                    : "border-[#dee1e6] bg-white text-[#565d6d]"
                }`}
              >
                <Icon
                  icon={ADMIN_STEP_ICONS[step]}
                  width={20}
                  height={20}
                  aria-hidden
                />
                <span className="text-[10px] font-semibold leading-tight">
                  {ADMIN_STEP_LABELS[step]}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-xs text-[#565d6d]">
          Status tersimpan:{" "}
          <span className="font-medium text-[#171a1f]">
            {serviceStatusLabel(order.status)}
          </span>
          {isTerminal
            ? " — order Selesai tidak dapat diubah lagi."
            : " — pilih status lalu simpan; form biaya hanya untuk Konfirmasi Biaya Tambahan."}
        </p>

        {showCostForm ? (
          <OrderCostItemsForm
            lineItems={lineItems}
            technicalNote={technicalNote}
            pending={pending}
            onLineItemsChange={setLineItems}
            onTechnicalNoteChange={setTechnicalNote}
          />
        ) : null}

        {showSimpleConfirm && draftStatus ? (
          <div className="mt-4 rounded-xl border border-[#dee1e6] bg-white p-4">
            <p className="text-sm text-[#171a1f]">
              Ubah status ke{" "}
              <span className="font-semibold">
                {serviceStatusLabel(draftStatus)}
              </span>
              ?
              {draftStatus === ServiceStatus.COMPLETED
                ? " Setelah disimpan, WhatsApp pelanggan akan terbuka dengan pesan konfirmasi selesai."
                : null}
            </p>
          </div>
        ) : null}
      </div>

      <OrderActivityTimeline
        order={order}
        draftStatus={draftStatus}
        onRefreshAfterAction={onRefreshAfterAction}
      />

      {footerEl && showFooter
        ? createPortal(
            <OrderDetailActionFooter
              variant={footerVariant}
              total={costTotal}
              pending={pending}
              draftLabel={
                draftStatus ? serviceStatusLabel(draftStatus) : undefined
              }
              notifyCustomerViaWhatsApp={
                draftStatus === ServiceStatus.COMPLETED
              }
              onSubmit={
                showCostForm
                  ? handleCostFormSubmit
                  : isTerminal
                    ? handleResendCompletionWhatsApp
                    : handleSimpleConfirm
              }
              onDelete={
                isTerminal
                  ? () => {
                      setDeleteDialogOpen(true);
                    }
                  : undefined
              }
            />,
            footerEl,
          )
        : null}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus data order?"
        description={`Order ${order.trackingId} akan dihapus permanen. Data tidak dapat dikembalikan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        pending={pending}
        onConfirm={handleDeleteCompletedOrder}
      />
    </>
  );
}
