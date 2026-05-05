import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "ri_admin_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/admin",
    maxAge: MAX_AGE_SEC,
  };
}

function requireSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET (minimal 16 karakter) wajib diatur.");
  }
  return secret;
}

function signBody(bodyB64u: string, secret: string) {
  return createHmac("sha256", secret).update(bodyB64u).digest("base64url");
}

export async function setAdminSessionCookie(): Promise<void> {
  const secret = requireSessionSecret();
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const body = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const sig = signBody(body, secret);
  const token = `${body}.${sig}`;
  (await cookies()).set(COOKIE_NAME, token, adminSessionCookieOptions());
}

export async function clearAdminSessionCookie(): Promise<void> {
  (await cookies()).set(COOKIE_NAME, "", { ...adminSessionCookieOptions(), maxAge: 0 });
}

export async function getAdminSessionValid(): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET?.trim();
    if (!secret || secret.length < 16) {
      return false;
    }

    const raw = (await cookies()).get(COOKIE_NAME)?.value;
    if (!raw) {
      return false;
    }

    const dot = raw.lastIndexOf(".");
    if (dot < 1) {
      return false;
    }

    const body = raw.slice(0, dot);
    const sig = raw.slice(dot + 1);
    const expected = signBody(body, secret);
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return false;
    }

    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { exp?: number };
    if (typeof decoded.exp !== "number" || decoded.exp <= Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function requireAdminSession(): Promise<void> {
  const ok = await getAdminSessionValid();
  if (!ok) {
    throw new Error("Sesi admin tidak valid.");
  }
}
