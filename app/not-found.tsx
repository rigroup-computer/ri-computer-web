import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-8">
      <div className="space-y-4 rounded-2xl border border-[#dee1e6] bg-white p-5 text-center shadow-sm">
        <p className="text-sm font-medium text-[#1a73e8]">404</p>
        <h1 className="text-lg font-semibold text-[#171a1f]">
          Halaman tidak ditemukan
        </h1>
        <p className="text-sm text-[#565d6d]">
          Tautan mungkin sudah tidak aktif atau alamatnya salah.
        </p>
        <div className="grid gap-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1a73e8] px-4 text-sm font-semibold text-white"
          >
            Ke beranda
          </Link>
          <Link
            href="/booking"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dee1e6] px-4 text-sm font-semibold text-[#171a1f]"
          >
            Booking servis
          </Link>
          <Link
            href="/tracking"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dee1e6] px-4 text-sm font-semibold text-[#171a1f]"
          >
            Lacak status
          </Link>
        </div>
      </div>
    </main>
  );
}
