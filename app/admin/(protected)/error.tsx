"use client";

import { useEffect } from "react";

function looksLikeDatabaseUnreachable(message: string): boolean {
  return (
    /can't reach database|reach database server|P1001|connection refused|ECONNREFUSED|neon\.tech|timed out|ETIMEDOUT/i.test(
      message,
    )
  );
}

export default function AdminProtectedError({
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
  const dbHint = looksLikeDatabaseUnreachable(message);

  return (
    <main className="mx-auto max-w-lg space-y-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-slate-900 shadow-sm">
      <h1 className="text-lg font-semibold text-amber-950">
        {dbHint ? "Tidak terhubung ke database" : "Ada masalah memuat halaman"}
      </h1>
      {dbHint ? (
        <div className="space-y-2 text-sm text-amber-950/90">
          <p>
            Server tidak bisa menjangkau PostgreSQL (mis. Neon). Cek apakah
            proyek Neon aktif (buka dashboard Neon untuk &quot;membangunkan&quot;
            database), string koneksi <code className="rounded bg-white/80 px-1">DATABASE_URL</code> di{" "}
            <code className="rounded bg-white/80 px-1">.env</code>, dan koneksi
            internet / VPN.
          </p>
        </div>
      ) : (
        <p className="text-sm text-amber-950/90">{message}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="h-11 rounded-xl bg-amber-800 px-4 text-sm font-semibold text-white shadow-sm"
        >
          Coba lagi
        </button>
        <a
          href="/admin"
          className="inline-flex h-11 items-center rounded-xl border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-950"
        >
          Ke dasbor
        </a>
      </div>
    </main>
  );
}
