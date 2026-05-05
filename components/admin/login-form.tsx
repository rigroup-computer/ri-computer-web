"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginAdminState } from "@/lib/actions/admin-auth";
import Link from "next/link";

function safeNextHref(next?: string): string | undefined {
  if (!next?.startsWith("/admin") || next.startsWith("//")) {
    return undefined;
  }
  return next;
}

export function AdminLoginForm({ nextPath }: { nextPath?: string }) {
  const next = safeNextHref(nextPath);

  const [state, action, pending] = useActionState(loginAdmin, {} satisfies LoginAdminState);

  return (
    <section className="px-6 py-8 w-full h-full relative">
      <div className="absolute bottom-full -left-10 rounded-full size-72 bg-linear-to-bl from-primary/50 via-primary/10 to-transparent" />
      <div className="absolute top-full -right-16 rounded-full size-44 bg-transparent ring-[4rem] ring-primary/5" />
      <h1 className="text-xl font-semibold text-mate-black">Login</h1>
      <p className="mt-1 text-xs text-mate-black/50">Area internal tidak ada tautan dari aplikasi pelanggan.</p>

      <form action={action} className="mt-6 grid gap-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <div className="grid gap-1">
          <label htmlFor="password" className="text-xs font-semibold uppercase text-slate-500">
            Kata sandi
          </label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="h-12 rounded-sm border border-primary/10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            placeholder="••••••••"
          />
        </div>

        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

        <button disabled={pending} type="submit" className="h-12 rounded-sm bg-blue-600 text-sm font-semibold text-white shadow-sm disabled:opacity-70">
          {pending ? "Memverifikasi..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        <Link href="/" className="text-blue-600">
          ← Kembali ke beranda pelanggan
        </Link>
      </p>
    </section>
  );
}
