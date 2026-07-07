"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertBookingUploadFile } from "@/lib/booking-issue-attachments";
import { authSdk } from "@/src/lib/sdk/auth";
import { marketplaceSdk } from "@/src/lib/sdk/marketplace";

function revalidateInventory() {
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/marketplace");
  revalidatePath("/");
}

export async function createInventoryItem(formData: FormData) {
  const isConsignment = formData.get("isConsignment") === "on";
  const isPublished = formData.get("isPublished") === "on";

  const parsed = z
    .object({
      title: z.string().min(3),
      price: z.coerce
        .bigint()
        .refine((v) => v > BigInt(0), { message: "Harga harus lebih dari 0" }),
      specs: z.string().min(5),
      isConsignment: z.boolean(),
      ownerContact: z.string().optional(),
      isPublished: z.boolean(),
    })
    .safeParse({
      title: formData.get("title"),
      price: formData.get("price"),
      specs: formData.get("specs"),
      isConsignment,
      ownerContact: formData.get("ownerContact")?.toString() ?? "",
      isPublished,
    });

  if (!parsed.success) {
    throw new Error("Data inventaris tidak valid.");
  }

  await authSdk.requireSession();

  let imageUrl: string | null = null;
  const uploadField = formData.get("image");

  if (uploadField instanceof File && uploadField.size > 0) {
    assertBookingUploadFile(uploadField);
    const buffer = Buffer.from(await uploadField.arrayBuffer());
    imageUrl = await marketplaceSdk.uploadInventoryImage(buffer);
  }

  if (
    parsed.data.isConsignment &&
    parsed.data.isPublished &&
    !parsed.data.ownerContact?.trim()
  ) {
    throw new Error(
      "Titip jual yang dipublikasi wajib memiliki kontak WhatsApp pemilik.",
    );
  }

  await marketplaceSdk.create({
    title: parsed.data.title,
    price: parsed.data.price,
    specs: parsed.data.specs,
    imageUrl,
    isConsignment: parsed.data.isConsignment,
    ownerContact: parsed.data.ownerContact?.trim()
      ? parsed.data.ownerContact.trim()
      : null,
    isPublished: parsed.data.isPublished,
  });

  revalidateInventory();
}

export async function setInventoryPublish(formData: FormData) {
  const publishedRaw = formData.get("isPublished")?.toString();
  const isPublished = publishedRaw === "true";

  const parsed = z
    .object({
      id: z.string().min(1),
      isPublished: z.boolean(),
    })
    .safeParse({
      id: formData.get("id"),
      isPublished,
    });

  if (!parsed.success) {
    throw new Error("Aksi tidak valid.");
  }

  await authSdk.requireSession();

  const existing = await marketplaceSdk.findById(parsed.data.id);

  if (!existing) {
    throw new Error("Listing tidak ditemukan.");
  }

  if (
    parsed.data.isPublished &&
    existing.isConsignment &&
    !(existing.ownerContact ?? "").trim()
  ) {
    throw new Error("Lengkapi kontak pemilik sebelum publish titip jual.");
  }

  await marketplaceSdk.update(parsed.data.id, {
    isPublished: parsed.data.isPublished,
  });

  revalidateInventory();
}

export async function deleteInventoryItem(formData: FormData) {
  const parsed = z
    .object({
      id: z.string().min(1),
    })
    .safeParse({
      id: formData.get("id"),
    });

  if (!parsed.success) {
    throw new Error("Aksi tidak valid.");
  }

  await authSdk.requireSession();

  await marketplaceSdk.delete(parsed.data.id);

  revalidateInventory();
}
