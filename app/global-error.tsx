"use client";

import { useEffect } from "react";
import { publicErrorDescription, publicErrorTitle } from "@/lib/error-display";

export default function GlobalError({
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
    <html lang="id">
      <body className="bg-[#f8fafc] text-[#171a1f]">
        <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
          <div className="w-full space-y-4 rounded-2xl border border-[#dee1e6] bg-white p-5 shadow-sm">
            <h1 className="text-lg font-semibold">{publicErrorTitle(message)}</h1>
            <p className="text-sm text-[#565d6d]">
              {publicErrorDescription(message)}
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#1a73e8] px-4 text-sm font-semibold text-white"
            >
              Coba lagi
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
