"use server";

import {
  configureCloudinary,
  uploadImageBufferToFolder,
} from "@/lib/cloudinary-image-upload";
import {
  MAX_ISSUE_ATTACHMENTS,
  assertBookingUploadFile,
} from "@/lib/booking-issue-attachments";

/**
 * Mengunggah satu gambar keluhan ke Cloudinary dan mengembalikan URL dengan f_auto,q_auto.
 */
export async function uploadBookingIssueImage(
  formData: FormData,
): Promise<{ url: string }> {
  const existingCountRaw = formData.get("existingCount");
  const existingCount =
    typeof existingCountRaw === "string" ? Number.parseInt(existingCountRaw, 10) : 0;

  if (Number.isNaN(existingCount) || existingCount < 0 || existingCount >= MAX_ISSUE_ATTACHMENTS) {
    throw new Error(`Maksimal ${MAX_ISSUE_ATTACHMENTS} foto per booking.`);
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Tidak ada berkas foto.");
  }

  assertBookingUploadFile(file);

  configureCloudinary();

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = process.env.CLOUDINARY_BOOKING_FOLDER ?? "booking-issues";

  const deliveryUrl = await uploadImageBufferToFolder(buffer, folder);

  return { url: deliveryUrl };
}
