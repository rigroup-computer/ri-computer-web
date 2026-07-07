"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import type { Prisma, ServiceType } from "@prisma/client";
import { parseIssueAttachmentUrlsFromFormField } from "@/lib/booking-issue-attachments";
import { formatIssueWithDeviceSpecs } from "@/lib/order-issue-content";
import {
  bookingValidationMessage,
  deliverySchema,
  isBookableServiceType,
  regularSchema,
} from "@/lib/booking-form-validation";
import { combineVisitDateTime, formatVisitDateTimeId } from "@/lib/store-hours";
import { generatePublicTrackingId } from "@/lib/tracking-id";
import {
  normalizePhoneForLookup,
  orderSdk,
} from "@/src/lib/sdk/orders";

function formatIssueWithSpecs(deviceSpecs: string, issue: string): string {
  return formatIssueWithDeviceSpecs(deviceSpecs, issue);
}

function timelineNoteForServiceType(serviceType: ServiceType): string {
  switch (serviceType) {
    case "DELIVERY":
      return "Antar Jemput — janji baru masuk sistem.";
    case "REGULAR":
      return "Datang ke Toko — janji baru masuk sistem.";
    default:
      return "Janji baru masuk sistem.";
  }
}

function normalizeCustomerPhone(phone: string): string {
  return normalizePhoneForLookup(phone) ?? phone.replace(/\D/gu, "");
}

export type CreateServiceOrderSuccess = {
  trackingId: string;
  shopWhatsApp?: string;
  serviceType: ServiceType;
  preferredVisitAt?: string;
  visitScheduleStatus?: "REQUESTED";
};

export type CreateServiceOrderResult =
  | ({ ok: true } & CreateServiceOrderSuccess)
  | { ok: false; error: string };

export async function createServiceOrder(
  formData: FormData,
): Promise<CreateServiceOrderResult> {
  const serviceTypeRaw = formData.get("serviceType");
  if (!isBookableServiceType(serviceTypeRaw)) {
    return {
      ok: false,
      error: "Pilih jenis layanan yang tersedia terlebih dahulu.",
    };
  }

  const serviceType = serviceTypeRaw;

  const basePayload = {
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    laptopBrand: formData.get("laptopBrand"),
    laptopModel: formData.get("laptopModel"),
    deviceSpecs: formData.get("deviceSpecs"),
    preferredVisitDate: formData.get("preferredVisitDate"),
    preferredVisitTime: formData.get("preferredVisitTime"),
    issue: formData.get("issue"),
  };

  const parsed =
    serviceType === "DELIVERY"
      ? deliverySchema.safeParse({
          ...basePayload,
          visitAddress: formData.get("visitAddress"),
        })
      : regularSchema.safeParse({
          ...basePayload,
          customerCity: formData.get("customerCity"),
        });

  if (!parsed.success) {
    return { ok: false, error: bookingValidationMessage(parsed.error) };
  }

  let attachmentUrls: string[];
  try {
    attachmentUrls = parseIssueAttachmentUrlsFromFormField(
      formData.get("issueAttachmentUrls"),
    );
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Data lampiran tidak valid.",
    };
  }

  let trackingId = "";
  for (let attempt = 0; attempt < 16; attempt++) {
    trackingId = generatePublicTrackingId();
    const taken = await orderSdk.isTrackingIdTaken(trackingId);
    if (!taken) {
      break;
    }
    if (attempt === 15) {
      return {
        ok: false,
        error: "Sistem sibuk membuat nomor lacak. Mohon coba lagi.",
      };
    }
  }

  const visitAddress =
    serviceType === "DELIVERY"
      ? (parsed.data as z.infer<typeof deliverySchema>).visitAddress
      : (parsed.data as z.infer<typeof regularSchema>).customerCity;

  const preferredVisitAt = combineVisitDateTime(
    parsed.data.preferredVisitDate,
    parsed.data.preferredVisitTime,
  );

  if (!preferredVisitAt) {
    return {
      ok: false,
      error: "Jadwal kunjungan tidak valid. Mohon pilih tanggal dan jam ulang.",
    };
  }

  try {
    const order = await orderSdk.create({
      trackingId,
      status: "RECEIVED",
      serviceType,
      customerName: parsed.data.customerName,
      customerPhone: normalizeCustomerPhone(parsed.data.customerPhone),
      laptopBrand: parsed.data.laptopBrand,
      laptopModel: parsed.data.laptopModel,
      issue: formatIssueWithSpecs(parsed.data.deviceSpecs, parsed.data.issue),
      issueAttachmentUrls:
        attachmentUrls.length > 0 ? attachmentUrls : undefined,
      visitAddress,
      preferredVisitAt,
      visitScheduleStatus: "REQUESTED",
    } as Prisma.ServiceOrderUncheckedCreateInput);

    await orderSdk.createTimeline({
      serviceOrderId: order.id,
      title: "Order diterima",
      note: timelineNoteForServiceType(serviceType),
    });

    await orderSdk.createTimeline({
      serviceOrderId: order.id,
      title: "Preferensi jadwal",
      note: formatVisitDateTimeId(preferredVisitAt),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/tracking");

    const shopWa = process.env.SHOP_WHATSAPP_NUMBER ?? "";

    return {
      ok: true,
      trackingId: order.trackingId,
      shopWhatsApp: shopWa.length ? shopWa : undefined,
      serviceType: order.serviceType,
      preferredVisitAt: preferredVisitAt.toISOString(),
      visitScheduleStatus: "REQUESTED",
    };
  } catch {
    return {
      ok: false,
      error: "Gagal menyimpan booking. Mohon coba lagi.",
    };
  }
}
