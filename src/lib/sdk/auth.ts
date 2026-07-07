/**
 * Admin session helpers for the `/admin` console.
 * Wraps cookie-based session utilities; does not expose customer auth (zero-auth public).
 */
import {
  clearAdminSessionCookie,
  getAdminSessionValid,
  requireAdminSession,
  setAdminSessionCookie,
} from "@/lib/admin-session";

export type AuthSessionState = Readonly<{
  valid: boolean;
}>;

/** Admin console session and password verification. */
export const authSdk = {
  async getSessionValid(): Promise<boolean> {
    return getAdminSessionValid();
  },

  /** @throws Redirect or error when the httpOnly admin session cookie is missing or invalid. */
  async requireSession(): Promise<void> {
    await requireAdminSession();
  },

  async setSession(): Promise<void> {
    await setAdminSessionCookie();
  },

  async clearSession(): Promise<void> {
    await clearAdminSessionCookie();
  },

  /**
   * Compare candidate password against `ADMIN_PASSWORD`.
   * @returns Discriminated result — never throws; check `ok` before proceeding.
   */
  verifyAdminPassword(candidate: string): Readonly<{ ok: true } | { ok: false; error: string }> {
    const expected = process.env.ADMIN_PASSWORD ?? "";
    if (!expected.trim()) {
      return { ok: false, error: "ADMIN_PASSWORD belum diatur di lingkungan server." };
    }

    if (candidate !== expected) {
      return { ok: false, error: "Kata sandi tidak sesuai." };
    }

    return { ok: true };
  },

  async getSessionState(): Promise<AuthSessionState> {
    return { valid: await getAdminSessionValid() };
  },
} as const;
