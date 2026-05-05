"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { parseIssueAttachmentUrlsFromFormField } from "@/lib/booking-issue-attachments";
import { prisma } from "@/lib/prisma";
import { generatePublicTrackingId } from "@/lib/tracking-id";

const emptyText = (raw: unknown) => {
  if (typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length ? trimmed : undefined;
};

const homeServiceSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  laptopBrand: z.preprocess(emptyText, z.string().max(120).optional()),
  laptopModel: z.preprocess(emptyText, z.string().max(160).optional()),
  issue: z.string().min(5),
  visitAddress: z.string().min(5),
  preferredVisitAt: z
    .string()
    .optional()
    .transform((raw) => {
      if (!raw || raw.trim().length === 0) {
        return undefined;
      }
      const date = new Date(raw);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }),
});

function bookingValidationMessage(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "Mohon lengkapi data janji kunjungan dan keluhan Anda.";
  }
  const key = issue.path[0];
  if (key === "issue") {
    return "Mohon jelaskan keluhan Anda (minimal 5 karakter).";
  }
  if (key === "customerName") {
    return "Mohon isi nama lengkap (minimal 2 karakter).";
  }
  if (key === "customerPhone") {
    return "Mohon isi nomor WhatsApp yang valid (minimal 8 digit).";
  }
  if (key === "visitAddress") {
    return "Mohon isi alamat kunjungan lengkap.";
  }
  return "Mohon lengkapi data janji kunjungan dan keluhan Anda.";
}

export type CreateServiceOrderResult = {
  trackingId: string;
  shopWhatsApp?: string;
};

export async function createServiceOrder(
  formData: FormData,
): Promise<CreateServiceOrderResult> {
  const parsed = homeServiceSchema.safeParse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    laptopBrand: formData.get("laptopBrand")?.toString() ?? "",
    laptopModel: formData.get("laptopModel")?.toString() ?? "",
    issue: formData.get("issue"),
    visitAddress: formData.get("visitAddress"),
    preferredVisitAt: formData.get("preferredVisitAt")?.toString(),
  });

  if (!parsed.success) {
    throw new Error(bookingValidationMessage(parsed.error));
  }

  let attachmentUrls: string[];
  try {
    attachmentUrls = parseIssueAttachmentUrlsFromFormField(
      formData.get("issueAttachmentUrls"),
    );
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Data lampiran tidak valid.",
    );
  }

  let trackingId = "";
  for (let attempt = 0; attempt < 16; attempt++) {
    trackingId = generatePublicTrackingId();
    const clash = await prisma.serviceOrder.findUnique({
      where: { trackingId },
      select: { id: true },
    });
    if (!clash) {
      break;
    }
    if (attempt === 15) {
      throw new Error("Sistem sibuk membuat nomor lacak. Mohon coba lagi.");
    }
  }

  const order = await prisma.serviceOrder.create({
    data: {
      trackingId,
      status: "RECEIVED",
      serviceType: "HOME_SERVICE",
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      laptopBrand: parsed.data.laptopBrand?.trim()
        ? parsed.data.laptopBrand.trim()
        : null,
      laptopModel: parsed.data.laptopModel?.trim()
        ? parsed.data.laptopModel.trim()
        : null,
      issue: parsed.data.issue,
      issueAttachmentUrls:
        attachmentUrls.length > 0 ? attachmentUrls : undefined,
      visitAddress: parsed.data.visitAddress,
      preferredVisitAt: parsed.data.preferredVisitAt ?? null,
    } as Prisma.ServiceOrderUncheckedCreateInput,
  });

  await prisma.serviceTimeline.create({
    data: {
      serviceOrderId: order.id,
      title: "Order diterima",
      note: "Home Service — janji baru masuk sistem.",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/tracking");

  const shopWa = process.env.SHOP_WHATSAPP_NUMBER ?? "";

  return {
    trackingId: order.trackingId,
    shopWhatsApp: shopWa.length ? shopWa : undefined,
  };
}
