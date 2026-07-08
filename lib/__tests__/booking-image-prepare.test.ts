import { describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  BOOKING_IMAGE_MAX_LONG_EDGE,
  prepareBookingIssueImageBuffer,
} from "@/lib/booking-image-prepare";

describe("prepareBookingIssueImageBuffer", () => {
  it("downsizes large JPEG uploads", async () => {
    const source = await sharp({
      create: {
        width: 4000,
        height: 3000,
        channels: 3,
        background: { r: 120, g: 80, b: 40 },
      },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    const prepared = await prepareBookingIssueImageBuffer(source, "image/jpeg");
    const meta = await sharp(prepared).metadata();

    expect(prepared.length).toBeLessThan(source.length);
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBeLessThanOrEqual(
      BOOKING_IMAGE_MAX_LONG_EDGE,
    );
  });

  it("passes GIF through unchanged", async () => {
    const gif = Buffer.from("GIF89a", "ascii");
    const prepared = await prepareBookingIssueImageBuffer(gif, "image/gif");
    expect(prepared).toEqual(gif);
  });
});
