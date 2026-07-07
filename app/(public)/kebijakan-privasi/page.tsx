import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi Ri Computer untuk layanan servis laptop dan katalog publik.",
};

export default function KebijakanPrivasiPage() {
  return (
    <main className="bg-white px-4 pb-28 pt-6 lg:mx-auto lg:max-w-3xl">
      <h1 className="text-xl font-bold text-slate-900">Kebijakan Privasi</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Halaman ini akan memuat kebijakan privasi lengkap Ri Computer — cara kami
        mengumpulkan, menggunakan, dan melindungi data yang Anda berikan saat
        booking servis, melacak status perbaikan, atau menghubungi toko.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Konten final sedang disusun. Untuk pertanyaan segera, hubungi kami lewat
        WhatsApp di beranda atau footer situs.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        Kembali ke beranda
      </Link>
    </main>
  );
}
