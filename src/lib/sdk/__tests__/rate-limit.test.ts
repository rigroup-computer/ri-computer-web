import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindUnique = vi.fn();
const mockUpsert = vi.fn();
const mockUpdate = vi.fn();
const mockDeleteMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimitEntry: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
  },
}));

import { rateLimitSdk } from "@/src/lib/sdk/rate-limit";

const options = { maxHits: 3, windowMs: 60_000 };

describe("rateLimitSdk.consumeRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({});
    mockUpdate.mockResolvedValue({});
  });

  it("creates a new bucket on first hit", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await rateLimitSdk.consumeRateLimit("test", "1.2.3.4", options);

    expect(result).toEqual({ ok: true });
    expect(mockUpsert).toHaveBeenCalledOnce();
  });

  it("blocks when the window is exhausted", async () => {
    mockFindUnique.mockResolvedValue({
      hitCount: 3,
      windowEndsAt: new Date(Date.now() + 30_000),
    });

    const result = await rateLimitSdk.consumeRateLimit("test", "1.2.3.4", options);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Terlalu banyak permintaan");
    }
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("increments an active bucket below the limit", async () => {
    mockFindUnique.mockResolvedValue({
      hitCount: 1,
      windowEndsAt: new Date(Date.now() + 30_000),
    });

    const result = await rateLimitSdk.consumeRateLimit("test", "1.2.3.4", options);

    expect(result).toEqual({ ok: true });
    expect(mockUpdate).toHaveBeenCalledOnce();
  });
});

describe("rateLimitSdk.isRateLimited", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok when no entry exists", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await rateLimitSdk.isRateLimited("adminLogin", "1.2.3.4", options);

    expect(result).toEqual({ ok: true });
  });
});
