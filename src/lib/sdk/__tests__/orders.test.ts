import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    serviceOrder: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    serviceTimeline: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/src/lib/sdk/marketplace", () => ({
  marketplaceSdk: {
    count: vi.fn().mockResolvedValue(0),
    fetchInventoryPreview: vi.fn().mockResolvedValue([]),
  },
}));

import { prisma } from "@/lib/prisma";
import {
  normalizePhoneForLookup,
  orderSdk,
} from "@/src/lib/sdk/orders";

describe("normalizePhoneForLookup", () => {
  it("strips non-digits and returns normalized phone", () => {
    expect(normalizePhoneForLookup("0812-3456-7890")).toBe("081234567890");
  });

  it("returns null for too-short input", () => {
    expect(normalizePhoneForLookup("08123")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(normalizePhoneForLookup("")).toBeNull();
  });
});

describe("orderSdk.lookupOrdersByPhone", () => {
  beforeEach(() => {
    vi.mocked(prisma.serviceOrder.findMany).mockReset();
    vi.mocked(prisma.serviceOrder.findMany).mockResolvedValue([]);
  });

  it("uses exact match on normalized digits, never contains", async () => {
    await orderSdk.lookupOrdersByPhone("0812-3456-7890");

    expect(prisma.serviceOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customerPhone: "081234567890" },
      }),
    );

    const call = vi.mocked(prisma.serviceOrder.findMany).mock.calls[0]?.[0];
    expect(call?.where).not.toHaveProperty("contains");
  });

  it("returns empty array for invalid phone", async () => {
    const result = await orderSdk.lookupOrdersByPhone("123");
    expect(result).toEqual([]);
    expect(prisma.serviceOrder.findMany).not.toHaveBeenCalled();
  });
});

describe("orderSdk.lookupOrderByTrackingId", () => {
  beforeEach(() => {
    vi.mocked(prisma.serviceOrder.findUnique).mockReset();
  });

  it("returns null for blank tracking id", async () => {
    const result = await orderSdk.lookupOrderByTrackingId("   ");
    expect(result).toBeNull();
    expect(prisma.serviceOrder.findUnique).not.toHaveBeenCalled();
  });
});

describe("orderSdk.isTrackingIdTaken", () => {
  beforeEach(() => {
    vi.mocked(prisma.serviceOrder.findUnique).mockReset();
  });

  it("returns true when order exists", async () => {
    vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
      id: "abc",
    } as never);

    expect(await orderSdk.isTrackingIdTaken("RC-123")).toBe(true);
  });

  it("returns false when order missing", async () => {
    vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue(null);

    expect(await orderSdk.isTrackingIdTaken("RC-123")).toBe(false);
  });
});
