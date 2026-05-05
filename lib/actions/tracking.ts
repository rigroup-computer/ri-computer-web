"use server";

import type { Prisma } from "@prisma/client";
import {
  normalizeStoredIssueAttachmentUrls,
} from "@/lib/booking-issue-attachments";
import { prisma } from "@/lib/prisma";
import { normalizeTrackingLookupInput } from "@/lib/tracking-id";

export type PublicOrderTimeline = {
  id: string;
  title: string;
  note: string | null;
  createdAt: Date;
};

export type PublicOrderView = {
  trackingId: string;
  customerName: string;
  customerPhone: string;
  laptopBrand: string | null;
  laptopModel: string | null;
  status: string;
  issue: string;
  visitAddress: string;
  preferredVisitAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  serviceType: string;
  timelines: PublicOrderTimeline[];
  /** URL Cloudinary dengan f_auto,q_auto */
  issueAttachmentUrls: string[];
};

function mapOrder(order: {
  trackingId: string;
  customerName: string;
  customerPhone: string;
  laptopBrand: string | null;
  laptopModel: string | null;
  status: string;
  issue: string;
  visitAddress: string;
  preferredVisitAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  serviceType: string;
  issueAttachmentUrls: Prisma.JsonValue | null;
  timelines: { id: string; title: string; note: string | null; createdAt: Date }[];
}): PublicOrderView {
  return {
    trackingId: order.trackingId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    laptopBrand: order.laptopBrand,
    laptopModel: order.laptopModel,
    status: order.status,
    issue: order.issue,
    visitAddress: order.visitAddress,
    preferredVisitAt: order.preferredVisitAt,
    updatedAt: order.updatedAt,
    createdAt: order.createdAt,
    serviceType: order.serviceType,
    issueAttachmentUrls: normalizeStoredIssueAttachmentUrls(
      order.issueAttachmentUrls,
    ),
    timelines: order.timelines.map((t) => ({
      id: t.id,
      title: t.title,
      note: t.note,
      createdAt: t.createdAt,
    })),
  };
}

export async function lookupOrderByTrackingId(trackingId: string): Promise<PublicOrderView | null> {
  const key = normalizeTrackingLookupInput(trackingId);
  if (!key) {
    return null;
  }

  const order = await prisma.serviceOrder.findUnique({
    where: { trackingId: key },
    include: {
      timelines: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return order ? mapOrder(order) : null;
}

export async function lookupOrdersByPhone(phoneRaw: string): Promise<PublicOrderView[]> {
  const digits = phoneRaw.replace(/\D/gu, "");
  if (!digits || digits.length < 8) {
    return [];
  }

  const orders = await prisma.serviceOrder.findMany({
    where: { customerPhone: { contains: digits } },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      timelines: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return orders.map(mapOrder);
}
