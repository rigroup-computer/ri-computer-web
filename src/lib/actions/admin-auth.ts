"use server";

import { redirect } from "next/navigation";
import {
  checkActionRateLimit,
  clearActionRateLimit,
  RATE_LIMIT_SCOPES,
  recordActionRateLimitHit,
} from "@/lib/server-rate-limit";
import { authSdk } from "@/src/lib/sdk/auth";

export type LoginAdminState = {
  error?: string;
};

function safeNextPath(candidate: unknown): string | undefined {
  if (typeof candidate !== "string") {
    return undefined;
  }
  if (!candidate.startsWith("/admin") || candidate.startsWith("//")) {
    return undefined;
  }
  return candidate;
}

export async function loginAdmin(
  _prev: LoginAdminState,
  formData: FormData,
): Promise<LoginAdminState> {
  const limited = await checkActionRateLimit(RATE_LIMIT_SCOPES.adminLogin);
  if (!limited.ok) {
    return { error: limited.error };
  }

  const passwordRaw = formData.get("password");
  const password = typeof passwordRaw === "string" ? passwordRaw : "";

  const verified = authSdk.verifyAdminPassword(password);
  if (!verified.ok) {
    await recordActionRateLimitHit(RATE_LIMIT_SCOPES.adminLogin);
    return { error: verified.error };
  }

  await clearActionRateLimit(RATE_LIMIT_SCOPES.adminLogin);

  try {
    await authSdk.setSession();
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Gagal membuat sesi admin.";
    return { error: msg };
  }

  const next = safeNextPath(formData.get("next"));
  redirect(next ?? "/admin");
}

export async function logoutAdmin() {
  if (await authSdk.getSessionValid()) {
    await authSdk.clearSession();
  }
  redirect("/admin/login");
}
