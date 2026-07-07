"use server";

import {
  MAX_ISSUE_ATTACHMENTS,
  assertBookingUploadFile,
} from "@/lib/booking-issue-attachments";
import { marketplaceSdk } from "@/src/lib/sdk/marketplace";

export async function uploadBookingIssueImage(
  formData: FormData,
): Promise<{ url: string }> {
  const existingCountRaw = formData.get("existingCount");
  const existingCount =
    typeof existingCountRaw === "string"
      ? Number.parseInt(existingCountRaw, 10)
      : 0;

  if (
    Number.isNaN(existingCount) ||
    existingCount < 0 ||
    existingCount >= MAX_ISSUE_ATTACHMENTS
  ) {
    throw new Error(`Maksimal ${MAX_ISSUE_ATTACHMENTS} foto per booking.`);
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Tidak ada berkas foto.");
  }

  assertBookingUploadFile(file);

  const buffer = Buffer.from(await file.arrayBuffer());
  const deliveryUrl = await marketplaceSdk.uploadBookingIssueImage(buffer);

  return { url: deliveryUrl };
}
