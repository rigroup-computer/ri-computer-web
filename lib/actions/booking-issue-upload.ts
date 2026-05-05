"use server";

import { v2 as cloudinary } from "cloudinary";

import {
  MAX_ISSUE_ATTACHMENTS,
  assertBookingUploadFile,
} from "@/lib/booking-issue-attachments";

function configureCloudinary(): void {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name?.trim() || !api_key?.trim() || !api_secret?.trim()) {
    throw new Error(
      "Upload foto tidak tersedia. Atur CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret });
}

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

  const result = await new Promise<{ public_id: string; version?: number }>(
    (resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
        },
        (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          if (!res?.public_id) {
            reject(new Error("Upload gagal."));
            return;
          }
          resolve({
            public_id: res.public_id,
            version: typeof res.version === "number" ? res.version : undefined,
          });
        },
      );

      upload.end(buffer);
    },
  );

  const deliveryUrl = cloudinary.url(result.public_id, {
    secure: true,
    resource_type: "image",
    transformation: [{ fetch_format: "auto", quality: "auto" }],
    ...(typeof result.version === "number" ? { version: result.version } : {}),
  });

  return { url: deliveryUrl };
}
