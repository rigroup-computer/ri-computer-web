"use server";

import { revalidatePath } from "next/cache";
import { ServiceStatus, VisitScheduleStatus } from "@prisma/client";
import { z } from "zod";
import { assertStatusTransitionAllowed } from "@/lib/service-order-status-transitions";
import { serviceStatusLabel } from "@/lib/service-status-label";
import {
  formatCostLineItemsForTimelineNote,
  serviceOrderCostLineItemsSchema,
} from "@/lib/service-order-cost-items";
import {
  buildVisitConfirmationWhatsAppMessage,
  buildVisitDeclineWhatsAppMessage,
  buildVisitRescheduleWhatsAppMessage,
} from "@/lib/admin-visit-confirmation-message";
import {
  combineAdminVisitDateTime,
  formatVisitDateTimeId,
} from "@/lib/store-hours";
import { authSdk } from "@/src/lib/sdk/auth";
import { orderSdk } from "@/src/lib/sdk/orders";

const statusEnum = z.nativeEnum(ServiceStatus);

function revalidateOrders() {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/tracking");
}

export type SubmitServiceOrderStatusResult = Readonly<{
  whatsAppMessage?: string;
}>;

export type ConfirmServiceVisitScheduleResult = Readonly<{
  whatsAppMessage?: string;
}>;

const visitScheduleActionEnum = z.enum(["confirm", "reschedule", "decline"]);

export async function confirmServiceVisitSchedule(
  formData: FormData,
): Promise<ConfirmServiceVisitScheduleResult> {
  const parsed = z
    .object({
      orderId: z.string().min(1),
      action: visitScheduleActionEnum,
      confirmedVisitDate: z.string().optional(),
      confirmedVisitTime: z.string().optional(),
      note: z.string().optional(),
    })
    .safeParse({
      orderId: formData.get("orderId"),
      action: formData.get("action"),
      confirmedVisitDate: formData.get("confirmedVisitDate") ?? undefined,
      confirmedVisitTime: formData.get("confirmedVisitTime") ?? undefined,
      note: formData.get("note") ?? undefined,
    });

  if (!parsed.success) {
    throw new Error("Data jadwal tidak valid.");
  }

  await authSdk.requireSession();

  const order = await orderSdk.findByIdSelect(parsed.data.orderId, {
    trackingId: true,
    customerName: true,
    customerPhone: true,
    preferredVisitAt: true,
    visitScheduleStatus: true,
  });

  if (!order) {
    throw new Error("Order tidak ditemukan.");
  }

  const note = parsed.data.note?.trim() || null;

  if (parsed.data.action === "decline") {
    await orderSdk.update(parsed.data.orderId, {
      visitScheduleStatus: VisitScheduleStatus.DECLINED,
      visitScheduleNote: note,
      confirmedVisitAt: null,
    });

    await orderSdk.createTimeline({
      serviceOrderId: parsed.data.orderId,
      title: "Preferensi jadwal ditolak",
      note:
        note ??
        "Tim Ri Computer akan menghubungi dan mengusulkan jadwal alternatif.",
    });

    revalidateOrders();

    return {
      whatsAppMessage: buildVisitDeclineWhatsAppMessage(
        order.customerName,
        order.trackingId,
        note,
      ),
    };
  }

  const confirmedVisitAt = combineAdminVisitDateTime(
    parsed.data.confirmedVisitDate ?? "",
    parsed.data.confirmedVisitTime ?? "",
  );

  if (!confirmedVisitAt) {
    throw new Error("Tanggal atau jam konfirmasi tidak valid.");
  }

  const nextStatus =
    parsed.data.action === "confirm"
      ? VisitScheduleStatus.CONFIRMED
      : VisitScheduleStatus.RESCHEDULED;

  await orderSdk.update(parsed.data.orderId, {
    visitScheduleStatus: nextStatus,
    confirmedVisitAt,
    visitScheduleNote: note,
  });

  const timelineTitle =
    nextStatus === VisitScheduleStatus.CONFIRMED
      ? "Jadwal dikonfirmasi"
      : "Jadwal alternatif diajukan";

  await orderSdk.createTimeline({
    serviceOrderId: parsed.data.orderId,
    title: timelineTitle,
    note: `${formatVisitDateTimeId(confirmedVisitAt)} WIB${note ? `\n\n${note}` : ""}`,
  });

  revalidateOrders();

  const whatsAppMessage =
    nextStatus === VisitScheduleStatus.CONFIRMED
      ? buildVisitConfirmationWhatsAppMessage(
          order.customerName,
          order.trackingId,
          confirmedVisitAt,
          note,
        )
      : buildVisitRescheduleWhatsAppMessage(
          order.customerName,
          order.trackingId,
          confirmedVisitAt,
          note,
        );

  return { whatsAppMessage };
}

export async function submitServiceOrderStatusUpdate(
  formData: FormData,
): Promise<SubmitServiceOrderStatusResult> {
  const orderId = formData.get("orderId");
  const statusRaw = formData.get("status");
  const costConfirmationNoteRaw = formData.get("costConfirmationNote");
  const lineItemsRaw = formData.get("lineItems");

  const baseParsed = z
    .object({
      orderId: z.string().min(1),
      status: statusEnum,
      costConfirmationNote: z.string().optional(),
    })
    .safeParse({
      orderId,
      status: statusRaw,
      costConfirmationNote:
        typeof costConfirmationNoteRaw === "string" &&
        costConfirmationNoteRaw.trim().length > 0
          ? costConfirmationNoteRaw.trim()
          : undefined,
    });

  if (!baseParsed.success) {
    throw new Error("Data status tidak valid.");
  }

  await authSdk.requireSession();

  const prev = await orderSdk.findByIdSelect(baseParsed.data.orderId, {
    status: true,
    trackingId: true,
    customerName: true,
    customerPhone: true,
    laptopBrand: true,
    laptopModel: true,
    serviceType: true,
    createdAt: true,
    costLineItems: true,
  });

  if (!prev) {
    throw new Error("Order tidak ditemukan.");
  }

  assertStatusTransitionAllowed(prev.status, baseParsed.data.status);

  if (baseParsed.data.status === prev.status) {
    throw new Error("Status tidak berubah.");
  }

  let lineItemsJson: { name: string; price: number }[] | undefined;
  let timelineNote = "Diperbarui dari dashboard admin.";

  if (baseParsed.data.status === ServiceStatus.READY) {
    let parsedLineItems: unknown;
    try {
      parsedLineItems =
        typeof lineItemsRaw === "string" ? JSON.parse(lineItemsRaw) : lineItemsRaw;
    } catch {
      throw new Error("Data item biaya tidak valid.");
    }

    const lineItemsParsed = serviceOrderCostLineItemsSchema.safeParse(parsedLineItems);
    if (!lineItemsParsed.success) {
      const firstIssue = lineItemsParsed.error.issues[0]?.message;
      throw new Error(firstIssue ?? "Item biaya tidak valid.");
    }

    lineItemsJson = lineItemsParsed.data;
    timelineNote = formatCostLineItemsForTimelineNote(
      lineItemsParsed.data,
      baseParsed.data.costConfirmationNote,
    );
  }

  await orderSdk.update(baseParsed.data.orderId, {
    status: baseParsed.data.status,
    ...(baseParsed.data.status === ServiceStatus.READY
      ? {
          costLineItems: lineItemsJson,
          costConfirmationNote: baseParsed.data.costConfirmationNote ?? null,
        }
      : {}),
  });

  await orderSdk.createTimeline({
    serviceOrderId: baseParsed.data.orderId,
    title: `Status: ${serviceStatusLabel(baseParsed.data.status)}`,
    note: timelineNote,
  });

  revalidateOrders();

  if (
    baseParsed.data.status === ServiceStatus.READY &&
    lineItemsJson &&
    lineItemsJson.length > 0
  ) {
    const { buildCostConfirmationWhatsAppMessage } = await import(
      "@/lib/admin-cost-confirmation-message"
    );
    return {
      whatsAppMessage: buildCostConfirmationWhatsAppMessage(
        prev.customerName,
        prev.trackingId,
        lineItemsJson,
        baseParsed.data.costConfirmationNote,
      ),
    };
  }

  if (baseParsed.data.status === ServiceStatus.COMPLETED) {
    const { buildCompletionWhatsAppMessage } = await import(
      "@/lib/admin-completion-whatsapp-message"
    );
    const { parseStoredCostLineItems } = await import(
      "@/lib/service-order-cost-items"
    );
    return {
      whatsAppMessage: buildCompletionWhatsAppMessage({
        customerName: prev.customerName,
        customerPhone: prev.customerPhone,
        laptopBrand: prev.laptopBrand,
        laptopModel: prev.laptopModel,
        serviceType: prev.serviceType,
        createdAt: prev.createdAt,
        costLineItems: parseStoredCostLineItems(prev.costLineItems),
      }),
    };
  }

  return {};
}

export async function updateServiceOrderStatus(formData: FormData) {
  const parsed = z
    .object({
      orderId: z.string().min(1),
      status: statusEnum,
    })
    .safeParse({
      orderId: formData.get("orderId"),
      status: formData.get("status"),
    });

  if (!parsed.success) {
    throw new Error("Data status tidak valid.");
  }

  await authSdk.requireSession();

  const prev = await orderSdk.findByIdSelect(parsed.data.orderId, {
    status: true,
  });

  if (!prev) {
    throw new Error("Order tidak ditemukan.");
  }

  assertStatusTransitionAllowed(prev.status, parsed.data.status);

  await orderSdk.update(parsed.data.orderId, {
    status: parsed.data.status,
  });

  if (prev.status !== parsed.data.status) {
    await orderSdk.createTimeline({
      serviceOrderId: parsed.data.orderId,
      title: `Status: ${serviceStatusLabel(parsed.data.status)}`,
      note: "Diperbarui dari dashboard admin.",
    });
  }

  revalidateOrders();
}

export async function appendServiceTimelineNote(formData: FormData) {
  const parsed = z
    .object({
      orderId: z.string().min(1),
      title: z.string().min(2),
      note: z.string().optional(),
    })
    .safeParse({
      orderId: formData.get("orderId"),
      title: formData.get("title"),
      note: formData.get("note") ?? undefined,
    });

  if (!parsed.success) {
    throw new Error("Catatan timeline tidak valid.");
  }

  await authSdk.requireSession();

  await orderSdk.createTimeline({
    serviceOrderId: parsed.data.orderId,
    title: parsed.data.title,
    note: parsed.data.note ?? null,
  });

  revalidateOrders();
}

export async function deleteCompletedServiceOrder(
  formData: FormData,
): Promise<void> {
  const parsed = z
    .object({
      orderId: z.string().min(1),
    })
    .safeParse({
      orderId: formData.get("orderId"),
    });

  if (!parsed.success) {
    throw new Error("Aksi tidak valid.");
  }

  await authSdk.requireSession();

  const order = await orderSdk.findByIdSelect(parsed.data.orderId, {
    status: true,
  });

  if (!order) {
    throw new Error("Order tidak ditemukan.");
  }

  if (order.status !== ServiceStatus.COMPLETED) {
    throw new Error("Hanya order berstatus Selesai yang dapat dihapus.");
  }

  await orderSdk.delete(parsed.data.orderId);

  revalidateOrders();
}
