import type { ServiceStatus, ServiceType } from "@prisma/client";
import {
  ADMIN_STATUS_WHERE,
  getAdminStatusBucket,
  type AdminStatusBucket,
} from "@/lib/admin-order-status-display";
import { prisma } from "@/lib/prisma";

export type AdminDashboardRecentOrder = {
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
};

export type AdminDashboardInventoryPreview = {
  id: string;
  title: string;
  price: bigint;
  imageUrl: string | null;
  isConsignment: boolean;
  isPublished: boolean;
};

export type AdminDashboardStats = {
  counts: {
    antrian: number;
    proses: number;
    selesai: number;
    inventarisPublished: number;
  };
  recentOrders: AdminDashboardRecentOrder[];
  inventoryPreview: AdminDashboardInventoryPreview[];
};

const RECENT_ORDERS_LIMIT = 5;
const INVENTORY_PREVIEW_LIMIT = 6;

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    antrian,
    proses,
    selesai,
    inventarisPublished,
    recentOrdersRaw,
    inventoryPreviewRaw,
  ] = await prisma.$transaction([
    prisma.serviceOrder.count({ where: ADMIN_STATUS_WHERE.antrian }),
    prisma.serviceOrder.count({ where: ADMIN_STATUS_WHERE.proses }),
    prisma.serviceOrder.count({ where: ADMIN_STATUS_WHERE.selesai }),
    prisma.inventoryItem.count({ where: { isPublished: true } }),
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
    prisma.inventoryItem.findMany({
      orderBy: { updatedAt: "desc" },
      take: INVENTORY_PREVIEW_LIMIT,
      select: {
        id: true,
        title: true,
        price: true,
        imageUrl: true,
        isConsignment: true,
        isPublished: true,
      },
    }),
  ]);

  const recentOrders: AdminDashboardRecentOrder[] = recentOrdersRaw.map(
    (order) => ({
      ...order,
      bucket: getAdminStatusBucket(order.status),
    }),
  );

  return {
    counts: {
      antrian,
      proses,
      selesai,
      inventarisPublished,
    },
    recentOrders,
    inventoryPreview: inventoryPreviewRaw,
  };
}
