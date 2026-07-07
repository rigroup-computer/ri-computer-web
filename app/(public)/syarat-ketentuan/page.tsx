import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan layanan Ri Computer untuk servis laptop dan katalog.",
};

export default function SyaratKetentuanPage() {
  return (
    <main className="bg-white px-4 pb-28 pt-6 lg:mx-auto lg:max-w-3xl">
      <h1 className="text-xl font-bold text-slate-900">Syarat &amp; Ketentuan</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Halaman ini akan memuat syarat dan ketentuan penggunaan layanan Ri
        Computer — termasuk booking Home Service, pelacakan status servis, dan
        informasi katalog laptop yang ditampilkan di situs.
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
