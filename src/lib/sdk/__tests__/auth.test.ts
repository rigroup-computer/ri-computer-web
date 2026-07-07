import { beforeEach, describe, expect, it, vi } from "vitest";
import { authSdk } from "@/src/lib/sdk/auth";

vi.mock("@/lib/admin-session", () => ({
  clearAdminSessionCookie: vi.fn(),
  getAdminSessionValid: vi.fn().mockResolvedValue(false),
  requireAdminSession: vi.fn(),
  setAdminSessionCookie: vi.fn(),
}));

describe("authSdk.verifyAdminPassword", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns ok when password matches", () => {
    vi.stubEnv("ADMIN_PASSWORD", "secret123");
    expect(authSdk.verifyAdminPassword("secret123")).toEqual({ ok: true });
  });

  it("returns error when password mismatches", () => {
    vi.stubEnv("ADMIN_PASSWORD", "secret123");
    const result = authSdk.verifyAdminPassword("wrong");
    expect(result).toEqual({ ok: false, error: "Kata sandi tidak sesuai." });
  });

  it("returns error when ADMIN_PASSWORD is unset", () => {
    delete process.env.ADMIN_PASSWORD;
    const result = authSdk.verifyAdminPassword("anything");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("ADMIN_PASSWORD");
    }
  });
});
