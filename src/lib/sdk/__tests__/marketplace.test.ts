import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inventoryItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/cloudinary-image-upload", () => ({
  uploadImageBufferToFolder: vi.fn().mockResolvedValue("https://cdn.example/img.jpg"),
}));

import { prisma } from "@/lib/prisma";
import { uploadImageBufferToFolder } from "@/lib/cloudinary-image-upload";
import { marketplaceSdk } from "@/src/lib/sdk/marketplace";

describe("marketplaceSdk.findPublished", () => {
  beforeEach(() => {
    vi.mocked(prisma.inventoryItem.findMany).mockReset();
    vi.mocked(prisma.inventoryItem.findMany).mockResolvedValue([]);
  });

  it("queries only published listings", async () => {
    await marketplaceSdk.findPublished();

    expect(prisma.inventoryItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublished: true },
      }),
    );
  });
});

describe("marketplaceSdk.uploadBookingIssueImage", () => {
  beforeEach(() => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "test");
    vi.stubEnv("CLOUDINARY_API_KEY", "key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
  });

  it("delegates upload to cloudinary helper", async () => {
    const url = await marketplaceSdk.uploadBookingIssueImage(
      Buffer.from("fake"),
    );
    expect(uploadImageBufferToFolder).toHaveBeenCalled();
    expect(url).toBe("https://cdn.example/img.jpg");
  });
});
