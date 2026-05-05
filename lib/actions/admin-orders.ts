"use server";

import { revalidatePath } from "next/cache";
import { ServiceStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-session";

const statusEnum = z.nativeEnum(ServiceStatus);

function revalidateOrders() {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/tracking");
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

  const prev = await prisma.serviceOrder.findUnique({ where: { id: parsed.data.orderId }, select: { status: true } });

  await prisma.serviceOrder.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status },
  });

  if (prev && prev.status !== parsed.data.status) {
    await prisma.serviceTimeline.create({
      data: {
        serviceOrderId: parsed.data.orderId,
        title: `Status: ${parsed.data.status}`,
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
