/**
 * Service-order data access for public tracking and the admin console.
 * Import from here — do not call `prisma` directly from Server Actions or RSC.
 */
import type { Prisma, ServiceStatus, ServiceType } from "@prisma/client";
import {
  normalizeStoredIssueAttachmentUrls,
} from "@/lib/booking-issue-attachments";
import {
  ADMIN_STATUS_WHERE,
  getAdminStatusBucket,
  type AdminStatusBucket,
} from "@/lib/admin-order-status-display";
import { prisma } from "@/lib/prisma";
import { normalizeTrackingLookupInput } from "@/lib/tracking-id";
import { prismaClient } from "./base";
import { marketplaceSdk, type InventoryPreviewItem } from "./marketplace";

const PUBLIC_LOOKUP_LIMIT = 20;
const RECENT_ORDERS_LIMIT = 5;

const orderTimelineInclude = {
  timelines: {
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.ServiceOrderInclude;

/** Timeline entry exposed on the public tracking page. */
export type PublicOrderTimeline = Readonly<{
  id: string;
  title: string;
  note: string | null;
  createdAt: Date;
}>;

/** Public-safe order shape for tracking lookup (no internal database IDs). */
export type PublicOrderView = Readonly<{
  trackingId: string;
  customerName: string;
  customerPhone: string;
  laptopBrand: string | null;
  laptopModel: string | null;
  status: string;
  issue: string;
  visitAddress: string;
  preferredVisitAt: Date | null;
  confirmedVisitAt: Date | null;
  visitScheduleStatus: string;
  visitScheduleNote: string | null;
  updatedAt: Date;
  createdAt: Date;
  serviceType: string;
  timelines: PublicOrderTimeline[];
  issueAttachmentUrls: string[];
}>;

export type AdminDashboardRecentOrder = Readonly<{
  id: string;
  trackingId: string;
  customerName: string;
  laptopBrand: string | null;
  laptopModel: string | null;
  status: ServiceStatus;
  serviceType: ServiceType;
  bucket: AdminStatusBucket;
  createdAt: Date;
  updatedAt: Date;
}>;

export type AdminDashboardInventoryPreview = InventoryPreviewItem;

/** Aggregated counts, recent orders, and inventory preview for the admin dashboard home. */
export type AdminDashboardStats = Readonly<{
  counts: Readonly<{
    antrian: number;
    proses: number;
    selesai: number;
    inventarisPublished: number;
  }>;
  recentOrders: AdminDashboardRecentOrder[];
  inventoryPreview: AdminDashboardInventoryPreview[];
}>;

type OrderWithTimelines = Prisma.ServiceOrderGetPayload<{
  include: typeof orderTimelineInclude;
}>;

function mapPublicOrder(order: OrderWithTimelines): PublicOrderView {
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
    confirmedVisitAt: order.confirmedVisitAt,
    visitScheduleStatus: order.visitScheduleStatus,
    visitScheduleNote: order.visitScheduleNote,
    updatedAt: order.updatedAt,
    createdAt: order.createdAt,
    serviceType: order.serviceType,
    issueAttachmentUrls: normalizeStoredIssueAttachmentUrls(
      order.issueAttachmentUrls,
    ),
    timelines: order.timelines.map((timeline) => ({
      id: timeline.id,
      title: timeline.title,
      note: timeline.note,
      createdAt: timeline.createdAt,
    })),
  };
}

/**
 * Normalize a phone string for lookup.
 * Strips non-digits; rejects inputs shorter than the Indonesian mobile minimum (10).
 * @returns Normalized digit string, or `null` when input is too short or empty.
 */
export function normalizePhoneForLookup(phoneRaw: string): string | null {
  const digits = phoneRaw.replace(/\D/gu, "");
  if (!digits || digits.length < 10) {
    return null;
  }
  return digits;
}

async function findManyWithTimelinesImpl(where: Prisma.ServiceOrderWhereInput) {
  return prisma.serviceOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: orderTimelineInclude,
  });
}

/** Service-order queries and mutations (public tracking + admin). */
export const orderSdk = {
  normalizePhoneForLookup,

  /**
   * Public tracking lookup by Tracking ID.
   * @returns Mapped order with timelines, or `null` when the ID is invalid or not found.
   */
  async lookupOrderByTrackingId(trackingId: string): Promise<PublicOrderView | null> {
    const key = normalizeTrackingLookupInput(trackingId);
    if (!key) {
      return null;
    }

    return prismaClient.execute("lookupOrderByTrackingId", async () => {
      const order = await prisma.serviceOrder.findUnique({
        where: { trackingId: key },
        include: orderTimelineInclude,
      });
      return order ? mapPublicOrder(order) : null;
    });
  },

  /**
   * Public tracking lookup by customer phone.
   * Uses exact match on normalized digits only — never substring/contains.
   * @returns Up to 20 orders, newest first; `[]` when input is invalid.
   */
  async lookupOrdersByPhone(phoneRaw: string): Promise<PublicOrderView[]> {
    const normalized = normalizePhoneForLookup(phoneRaw);
    if (!normalized) {
      return [];
    }

    return prismaClient.execute("lookupOrdersByPhone", async () => {
      const orders = await prisma.serviceOrder.findMany({
        where: { customerPhone: normalized },
        orderBy: { createdAt: "desc" },
        take: PUBLIC_LOOKUP_LIMIT,
        include: orderTimelineInclude,
      });
      return orders.map(mapPublicOrder);
    });
  },

  async isTrackingIdTaken(trackingId: string): Promise<boolean> {
    const existing = await prisma.serviceOrder.findUnique({
      where: { trackingId },
      select: { id: true },
    });
    return existing !== null;
  },

  async findMany(
    where: Prisma.ServiceOrderWhereInput,
    options?: Readonly<{
      take?: number;
      orderBy?: Prisma.ServiceOrderOrderByWithRelationInput;
    }>,
  ) {
    return prisma.serviceOrder.findMany({
      where,
      orderBy: options?.orderBy ?? { createdAt: "desc" },
      take: options?.take,
    });
  },

  async findById(id: string) {
    return prisma.serviceOrder.findUnique({ where: { id } });
  },

  async findByIdSelect<T extends Prisma.ServiceOrderSelect>(
    id: string,
    select: T,
  ): Promise<Prisma.ServiceOrderGetPayload<{ select: T }> | null> {
    return prisma.serviceOrder.findUnique({ where: { id }, select });
  },

  findManyWithTimelines: findManyWithTimelinesImpl,

  /** Admin orders console — alias for {@link findManyWithTimelines}. */
  searchAdminOrders: findManyWithTimelinesImpl,

  async count(where: Prisma.ServiceOrderWhereInput): Promise<number> {
    return prisma.serviceOrder.count({ where });
  },

  async create(data: Prisma.ServiceOrderUncheckedCreateInput) {
    return prisma.serviceOrder.create({ data });
  },

  async update(id: string, data: Prisma.ServiceOrderUpdateInput) {
    return prisma.serviceOrder.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.serviceOrder.delete({ where: { id } });
  },

  async createTimeline(data: Prisma.ServiceTimelineUncheckedCreateInput) {
    return prisma.serviceTimeline.create({ data });
  },

  /** Parallel status counts, recent orders, and inventory preview for admin home. */
  async fetchDashboardStats(): Promise<AdminDashboardStats> {
    const [antrian, proses, selesai, inventarisPublished, recentOrdersRaw, inventoryPreview] =
      await Promise.all([
        prisma.serviceOrder.count({ where: ADMIN_STATUS_WHERE.antrian }),
        prisma.serviceOrder.count({ where: ADMIN_STATUS_WHERE.proses }),
        prisma.serviceOrder.count({ where: ADMIN_STATUS_WHERE.selesai }),
        marketplaceSdk.count({ isPublished: true }),
        prisma.serviceOrder.findMany({
          orderBy: { updatedAt: "desc" },
          take: RECENT_ORDERS_LIMIT,
          select: {
            id: true,
            trackingId: true,
            customerName: true,
            laptopBrand: true,
            laptopModel: true,
            status: true,
            serviceType: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        marketplaceSdk.fetchInventoryPreview(),
      ]);

    return {
      counts: { antrian, proses, selesai, inventarisPublished },
      recentOrders: recentOrdersRaw.map((order) => ({
        ...order,
        bucket: getAdminStatusBucket(order.status),
      })),
      inventoryPreview,
    };
  },
} as const;
