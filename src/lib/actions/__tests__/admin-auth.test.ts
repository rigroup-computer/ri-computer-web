import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCheckActionRateLimit = vi.fn();
const mockRecordActionRateLimitHit = vi.fn();
const mockClearActionRateLimit = vi.fn();
const mockVerifyAdminPassword = vi.fn();
const mockSetSession = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/lib/server-rate-limit", () => ({
  RATE_LIMIT_SCOPES: {
    adminLogin: {
      scope: "adminLogin",
      maxHits: 5,
      windowMs: 900_000,
    },
  },
  checkActionRateLimit: (...args: unknown[]) =>
    mockCheckActionRateLimit(...args),
  recordActionRateLimitHit: (...args: unknown[]) =>
    mockRecordActionRateLimitHit(...args),
  clearActionRateLimit: (...args: unknown[]) =>
    mockClearActionRateLimit(...args),
}));

vi.mock("@/src/lib/sdk/auth", () => ({
  authSdk: {
    verifyAdminPassword: (...args: unknown[]) =>
      mockVerifyAdminPassword(...args),
    setSession: (...args: unknown[]) => mockSetSession(...args),
  },
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    throw new Error("NEXT_REDIRECT");
  },
}));

import { loginAdmin } from "@/src/lib/actions/admin-auth";

describe("loginAdmin throttling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckActionRateLimit.mockResolvedValue({ ok: true });
    mockRecordActionRateLimitHit.mockResolvedValue(undefined);
    mockClearActionRateLimit.mockResolvedValue(undefined);
    mockSetSession.mockResolvedValue(undefined);
  });

  it("blocks login when the IP is rate limited", async () => {
    mockCheckActionRateLimit.mockResolvedValue({
      ok: false,
      error: "Terlalu banyak permintaan. Coba lagi dalam 15 menit.",
      retryAfterMs: 900_000,
    });

    const result = await loginAdmin({}, new FormData());

    expect(result).toEqual({
      error: "Terlalu banyak permintaan. Coba lagi dalam 15 menit.",
    });
    expect(mockVerifyAdminPassword).not.toHaveBeenCalled();
  });

  it("records a failed attempt without clearing the bucket", async () => {
    mockVerifyAdminPassword.mockReturnValue({
      ok: false,
      error: "Kata sandi tidak sesuai.",
    });

    const formData = new FormData();
    formData.set("password", "wrong");

    const result = await loginAdmin({}, formData);

    expect(result).toEqual({ error: "Kata sandi tidak sesuai." });
    expect(mockRecordActionRateLimitHit).toHaveBeenCalledOnce();
    expect(mockClearActionRateLimit).not.toHaveBeenCalled();
  });

  it("clears the bucket after a successful login", async () => {
    mockVerifyAdminPassword.mockReturnValue({ ok: true });

    const formData = new FormData();
    formData.set("password", "secret");

    await expect(loginAdmin({}, formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(mockClearActionRateLimit).toHaveBeenCalledOnce();
    expect(mockRecordActionRateLimitHit).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/admin");
  });
});
