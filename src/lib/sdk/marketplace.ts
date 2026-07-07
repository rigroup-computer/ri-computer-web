/**
 * Inventory catalog and Cloudinary uploads for marketplace listings and booking attachments.
 */
import type { Prisma } from "@prisma/client";
import { uploadImageBufferToFolder } from "@/lib/cloudinary-image-upload";
import { prisma } from "@/lib/prisma";
import { cloudinaryClient, prismaClient } from "./base";

const INVENTORY_PREVIEW_LIMIT = 6;

/** Subset of inventory fields used on the public homepage preview grid. */
export type InventoryPreviewItem = Readonly<{
  id: string;
  title: string;
  price: bigint;
  imageUrl: string | null;
  isConsignment: boolean;
  isPublished: boolean;
}>;

/** Inventory CRUD, preview queries, and image uploads. */
export const marketplaceSdk = {
  /** Published listings only; defaults to `createdAt` descending. */
  async findPublished(
    options?: Readonly<{ take?: number; orderBy?: Prisma.InventoryItemOrderByWithRelationInput }>,
  ) {
    return prisma.inventoryItem.findMany({
      where: { isPublished: true },
      orderBy: options?.orderBy ?? { createdAt: "desc" },
      take: options?.take,
    });
  },

  async findAll(
    options?: Readonly<{ orderBy?: Prisma.InventoryItemOrderByWithRelationInput }>,
  ) {
    return prisma.inventoryItem.findMany({
      orderBy: options?.orderBy ?? { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.inventoryItem.findUnique({ where: { id } });
  },

  async count(where: Prisma.InventoryItemWhereInput): Promise<number> {
    return prisma.inventoryItem.count({ where });
  },

  async create(data: Prisma.InventoryItemUncheckedCreateInput) {
    return prismaClient.execute("createInventoryItem", () =>
      prisma.inventoryItem.create({ data }),
    );
  },

  async update(id: string, data: Prisma.InventoryItemUpdateInput) {
    return prismaClient.execute("updateInventoryItem", () =>
      prisma.inventoryItem.update({ where: { id }, data }),
    );
  },

  async delete(id: string) {
    return prismaClient.execute("deleteInventoryItem", () =>
      prisma.inventoryItem.delete({ where: { id } }),
    );
  },

  /** Recent items for homepage preview; defaults to six rows. */
  async fetchInventoryPreview(
    limit: number = INVENTORY_PREVIEW_LIMIT,
  ): Promise<InventoryPreviewItem[]> {
    return prisma.inventoryItem.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
        imageUrl: true,
        isConsignment: true,
        isPublished: true,
      },
    });
  },

  /** Upload to `CLOUDINARY_INVENTORY_FOLDER` (fallback: `inventory-listings`). */
  async uploadInventoryImage(buffer: Buffer): Promise<string> {
    cloudinaryClient.configureCloudinary();
    const folder = cloudinaryClient.getCloudinaryFolder(
      "CLOUDINARY_INVENTORY_FOLDER",
      "inventory-listings",
    );
    return cloudinaryClient.execute("uploadInventoryImage", () =>
      uploadImageBufferToFolder(buffer, folder),
    );
  },

  /** Upload to `CLOUDINARY_BOOKING_FOLDER` (fallback: `booking-issues`). */
  async uploadBookingIssueImage(buffer: Buffer): Promise<string> {
    cloudinaryClient.configureCloudinary();
    const folder = cloudinaryClient.getCloudinaryFolder(
      "CLOUDINARY_BOOKING_FOLDER",
      "booking-issues",
    );
    return cloudinaryClient.execute("uploadBookingIssueImage", () =>
      uploadImageBufferToFolder(buffer, folder),
    );
  },
} as const;
