"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  publicErrorDescription,
  publicErrorTitle,
} from "@/lib/error-display";

export default function PublicError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message = error.message ?? "Terjadi kesalahan.";

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-8">
      <div className="space-y-4 rounded-2xl border border-[#dee1e6] bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-[#171a1f]">
          {publicErrorTitle(message)}
        </h1>
        <p className="text-sm text-[#565d6d]">
          {publicErrorDescription(message)}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1a73e8] px-4 text-sm font-semibold text-white"
          >
            Coba lagi
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dee1e6] px-4 text-sm font-semibold text-[#171a1f]"
          >
            Ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
