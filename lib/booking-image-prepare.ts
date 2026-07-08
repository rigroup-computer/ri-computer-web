import sharp from "sharp";

export const BOOKING_IMAGE_MAX_LONG_EDGE = 1600;
export const BOOKING_IMAGE_JPEG_QUALITY = 82;
export const BOOKING_IMAGE_WEBP_QUALITY = 82;

/** Resize and compress booking issue photos before Cloudinary upload. */
export async function prepareBookingIssueImageBuffer(
  buffer: Buffer,
  mimeType: string,
): Promise<Buffer> {
  if (mimeType === "image/gif") {
    return buffer;
  }

  try {
    let pipeline = sharp(buffer, { failOn: "none" }).rotate();
    const meta = await pipeline.metadata();
    const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);

    if (longEdge > BOOKING_IMAGE_MAX_LONG_EDGE) {
      pipeline = pipeline.resize(
        BOOKING_IMAGE_MAX_LONG_EDGE,
        BOOKING_IMAGE_MAX_LONG_EDGE,
        {
          fit: "inside",
          withoutEnlargement: true,
        },
      );
    }

    if (mimeType === "image/png" || mimeType === "image/webp") {
      return pipeline.webp({ quality: BOOKING_IMAGE_WEBP_QUALITY }).toBuffer();
    }

    return pipeline
      .jpeg({ quality: BOOKING_IMAGE_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new Error("Foto tidak dapat diproses. Coba file JPG atau PNG lain.");
  }
}
