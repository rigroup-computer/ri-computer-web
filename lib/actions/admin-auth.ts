"use server";

import { redirect } from "next/navigation";
import { clearAdminSessionCookie, getAdminSessionValid, setAdminSessionCookie } from "@/lib/admin-session";

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

export async function loginAdmin(_prev: LoginAdminState, formData: FormData): Promise<LoginAdminState> {
  const passwordRaw = formData.get("password");
  const password = typeof passwordRaw === "string" ? passwordRaw : "";

  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected.trim()) {
    return { error: "ADMIN_PASSWORD belum diatur di lingkungan server." };
  }

  if (password !== expected) {
    return { error: "Kata sandi tidak sesuai." };
  }

  try {
    await setAdminSessionCookie();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal membuat sesi admin.";
    return { error: msg };
  }

  const next = safeNextPath(formData.get("next"));
  redirect(next ?? "/admin");
}

export async function logoutAdmin() {
  if (await getAdminSessionValid()) {
    await clearAdminSessionCookie();
  }
  redirect("/admin/login");
}
