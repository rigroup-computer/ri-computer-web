import type { Prisma } from "@prisma/client";
import { z } from "zod";

export const MAX_ISSUE_ATTACHMENTS = 5;

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** URL delivery Cloudinary dengan transformasi hemat bandwidth */
const cloudinaryDeliveryUrlSchema = z.string().url().refine((url) => {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      u.hostname === "res.cloudinary.com" &&
      u.pathname.includes("/image/upload/")
    );
  } catch {
    return false;
  }
}, "URL lampiran tidak valid");

export const issueAttachmentUrlsSchema = z
  .array(cloudinaryDeliveryUrlSchema)
  .max(MAX_ISSUE_ATTACHMENTS);

/** Normalisasi nilai Json dari Prisma ke daftar URL string. */
export function normalizeStoredIssueAttachmentUrls(
  value: Prisma.JsonValue | null | undefined,
): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    return [];
  }
  const out = value.filter((x): x is string => typeof x === "string");
  return out.slice(0, MAX_ISSUE_ATTACHMENTS);
}

export function parseIssueAttachmentUrlsFromFormField(
  raw: FormDataEntryValue | null,
): string[] {
  if (raw === null || raw === "") {
    return [];
  }
  const str = typeof raw === "string" ? raw : "";
  if (!str.trim()) {
    return [];
  }
  let data: unknown;
  try {
    data = JSON.parse(str) as unknown;
  } catch {
    throw new Error("Format lampiran foto tidak valid.");
  }
  if (!Array.isArray(data)) {
    throw new Error("Lampiran harus berupa daftar URL.");
  }
  const parsed = issueAttachmentUrlsSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("URL lampiran tidak diizinkan atau terlalu banyak (maks 5).");
  }
  return parsed.data;
}

export const BOOKING_UPLOAD_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type BookingUploadMime = (typeof BOOKING_UPLOAD_ALLOWED_TYPES)[number];

export function assertBookingUploadFile(file: File): void {
  if (!BOOKING_UPLOAD_ALLOWED_TYPES.includes(file.type as BookingUploadMime)) {
    throw new Error("Gunakan JPG, PNG, WebP, atau GIF.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Ukuran foto maksimal 5 MB.");
  }
}
