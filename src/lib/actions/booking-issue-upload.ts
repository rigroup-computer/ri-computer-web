"use server";

import {
  consumeActionRateLimit,
  RATE_LIMIT_SCOPES,
} from "@/lib/server-rate-limit";
import {
  MAX_ISSUE_ATTACHMENTS,
  assertBookingUploadFile,
} from "@/lib/booking-issue-attachments";
import { prepareBookingIssueImageBuffer } from "@/lib/booking-image-prepare";
import { serverActionFailureMessage } from "@/lib/server-action-error";
import { marketplaceSdk } from "@/src/lib/sdk/marketplace";

export type UploadBookingIssueImageResult =
  | Readonly<{ ok: true; url: string }>
  | Readonly<{ ok: false; error: string }>;

export async function uploadBookingIssueImage(
  formData: FormData,
): Promise<UploadBookingIssueImageResult> {
  try {
    let limited;
    try {
      limited = await consumeActionRateLimit(
        RATE_LIMIT_SCOPES.uploadBookingIssueImage,
      );
    } catch (err) {
      return {
        ok: false,
        error: serverActionFailureMessage(
          err,
          "Gagal memproses unggahan foto.",
        ),
      };
    }
    if (!limited.ok) {
      return { ok: false, error: limited.error };
    }

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
      return {
        ok: false,
        error: `Maksimal ${MAX_ISSUE_ATTACHMENTS} foto per booking.`,
      };
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { ok: false, error: "Tidak ada berkas foto." };
    }

    assertBookingUploadFile(file);

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const buffer = await prepareBookingIssueImageBuffer(rawBuffer, file.type);

    const deliveryUrl = await marketplaceSdk.uploadBookingIssueImage(buffer);
    return { ok: true, url: deliveryUrl };
  } catch (err) {
    return {
      ok: false,
      error: serverActionFailureMessage(err, "Gagal mengunggah foto."),
    };
  }
}
