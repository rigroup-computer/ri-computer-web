"use client";

import { useActionState } from "react";
import Image from "next/image";
import { loginAdmin, type LoginAdminState } from "@/src/lib/actions/admin-auth";
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
    <section className="relative h-full w-full px-6 py-8 lg:px-0 lg:py-0">
      <div className="absolute bottom-full -left-10 size-72 rounded-full bg-linear-to-bl from-primary/50 via-primary/10 to-transparent lg:hidden" />
      <div className="absolute top-full -right-16 size-44 rounded-full bg-transparent ring-[4rem] ring-primary/5 lg:hidden" />

      <div className="relative lg:overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200/80 lg:bg-white lg:px-10 lg:py-10 lg:shadow-[0_8px_30px_rgb(37,99,235,0.08),0_4px_12px_rgb(15,23,42,0.06)]">
        <div className="absolute -right-20 -top-20 hidden size-56 rounded-full bg-primary/5 lg:block" aria-hidden />
        <div className="absolute -bottom-16 -left-16 hidden size-40 rounded-full bg-primary/10 lg:block" aria-hidden />

        <div className="relative hidden lg:mb-8 lg:flex lg:flex-col lg:items-center lg:gap-3">
          <span className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-primary/5 ring-1 ring-primary/10">
            <Image
              src="/images/brand/ic-brand.png"
              alt=""
              width={56}
              height={56}
              className="h-11 w-11 object-contain"
              priority
            />
          </span>
          <div className="text-center">
            <p className="text-lg font-bold tracking-tight text-mate-black">Ri Computer</p>
            <p className="text-xs font-medium text-primary">Konsol Admin</p>
          </div>
        </div>

        <h1 className="relative text-xl font-semibold text-mate-black lg:text-center lg:text-2xl lg:font-bold lg:tracking-tight">
          Login
        </h1>
        <p className="relative mt-1 text-xs text-mate-black/50 lg:mx-auto lg:mt-2 lg:max-w-xs lg:text-center lg:text-sm lg:text-slate-500">
          Area internal tidak ada tautan dari aplikasi pelanggan.
        </p>

        <form action={action} className="relative mt-6 grid gap-4 lg:mt-8 lg:gap-5">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <div className="grid gap-1 lg:gap-2">
            <label htmlFor="password" className="text-xs font-semibold uppercase text-slate-500 lg:text-[0.6875rem] lg:tracking-wide">
              Kata sandi
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="h-12 rounded-sm border border-primary/10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 lg:h-11 lg:rounded-lg lg:border-slate-200 lg:bg-slate-50/50 lg:px-4 lg:focus:border-primary lg:focus:bg-white lg:focus:ring-2 lg:focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>

          {state.error ? (
            <p className="text-sm text-red-600 lg:rounded-lg lg:border lg:border-red-100 lg:bg-red-50 lg:px-3 lg:py-2">
              {state.error}
            </p>
          ) : null}

          <button
            disabled={pending}
            type="submit"
            className="h-12 rounded-sm bg-blue-600 text-sm font-semibold text-white shadow-sm disabled:opacity-70 lg:h-11 lg:rounded-lg lg:bg-primary lg:font-bold lg:shadow-md lg:transition-colors lg:hover:bg-primary-dark lg:disabled:hover:bg-primary"
          >
            {pending ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>

        <p className="relative mt-6 text-center text-xs text-slate-500 lg:mt-8 lg:border-t lg:border-slate-100 lg:pt-6">
          <Link href="/" className="text-blue-600 lg:font-medium lg:text-primary lg:transition-colors lg:hover:text-primary-dark">
            ← Kembali ke beranda pelanggan
          </Link>
        </p>
      </div>
    </section>
  );
}
