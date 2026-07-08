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
import { looksLikeDatabaseUnreachable } from "@/lib/error-display";
import { SdkError } from "@/src/lib/sdk/base";
import { marketplaceSdk } from "@/src/lib/sdk/marketplace";

function actionFailureMessage(err: unknown): string {
  if (err instanceof SdkError) {
    const causeMessage =
      err.cause instanceof Error
        ? err.cause.message
        : typeof err.cause === "object" &&
            err.cause !== null &&
            "message" in err.cause &&
            typeof err.cause.message === "string"
          ? err.cause.message
          : "";

    if (looksLikeDatabaseUnreachable(causeMessage)) {
      return "Database sementara tidak tersedia. Tunggu beberapa detik lalu coba lagi.";
    }

    if (
      err.cause &&
      typeof err.cause === "object" &&
      "name" in err.cause &&
      err.cause.name === "TimeoutError"
    ) {
      return "Unggah foto timeout. Periksa koneksi internet lalu coba lagi.";
    }

    if (err.code === "ENV_MISSING") {
      return err.message;
    }
  }

  if (err instanceof Error) {
    if (looksLikeDatabaseUnreachable(err.message)) {
      return "Database sementara tidak tersedia. Tunggu beberapa detik lalu coba lagi.";
    }
    return err.message;
  }

  return "Gagal mengunggah foto.";
}

export async function uploadBookingIssueImage(
  formData: FormData,
): Promise<{ url: string }> {
  let limited;
  try {
    limited = await consumeActionRateLimit(
      RATE_LIMIT_SCOPES.uploadBookingIssueImage,
    );
  } catch (err) {
    throw new Error(actionFailureMessage(err));
  }
  if (!limited.ok) {
    throw new Error(limited.error);
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
    throw new Error(`Maksimal ${MAX_ISSUE_ATTACHMENTS} foto per booking.`);
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Tidak ada berkas foto.");
  }

  assertBookingUploadFile(file);

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const buffer = await prepareBookingIssueImageBuffer(rawBuffer, file.type);

  try {
    const deliveryUrl = await marketplaceSdk.uploadBookingIssueImage(buffer);
    return { url: deliveryUrl };
  } catch (err) {
    throw new Error(actionFailureMessage(err));
  }
}
