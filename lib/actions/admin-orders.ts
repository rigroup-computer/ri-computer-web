"use server";

import { revalidatePath } from "next/cache";
import { ServiceStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-session";
import { assertStatusTransitionAllowed } from "@/lib/service-order-status-transitions";
import { serviceStatusLabel } from "@/lib/service-status-label";
import {
  formatCostLineItemsForTimelineNote,
  serviceOrderCostLineItemsSchema,
} from "@/lib/service-order-cost-items";

const statusEnum = z.nativeEnum(ServiceStatus);

function revalidateOrders() {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/tracking");
}

export type SubmitServiceOrderStatusResult = Readonly<{
  whatsAppMessage?: string;
}>;

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

  await requireAdminSession();

  const prev = await prisma.serviceOrder.findUnique({
    where: { id: baseParsed.data.orderId },
    select: {
      status: true,
      trackingId: true,
      customerName: true,
    },
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

  await prisma.serviceOrder.update({
    where: { id: baseParsed.data.orderId },
    data: {
      status: baseParsed.data.status,
      ...(baseParsed.data.status === ServiceStatus.READY
        ? {
            costLineItems: lineItemsJson,
            costConfirmationNote: baseParsed.data.costConfirmationNote ?? null,
          }
        : {}),
    },
  });

  await prisma.serviceTimeline.create({
    data: {
      serviceOrderId: baseParsed.data.orderId,
      title: `Status: ${serviceStatusLabel(baseParsed.data.status)}`,
      note: timelineNote,
    },
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

  await requireAdminSession();

  const prev = await prisma.serviceOrder.findUnique({
    where: { id: parsed.data.orderId },
    select: { status: true },
  });

  if (!prev) {
    throw new Error("Order tidak ditemukan.");
  }

  assertStatusTransitionAllowed(prev.status, parsed.data.status);

  await prisma.serviceOrder.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status },
  });

  if (prev.status !== parsed.data.status) {
    await prisma.serviceTimeline.create({
      data: {
        serviceOrderId: parsed.data.orderId,
        title: `Status: ${serviceStatusLabel(parsed.data.status)}`,
        note: "Diperbarui dari dashboard admin.",
      },
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

  await requireAdminSession();

  await prisma.serviceTimeline.create({
    data: {
      serviceOrderId: parsed.data.orderId,
      title: parsed.data.title,
      note: parsed.data.note ?? null,
    },
  });

  revalidateOrders();
}
