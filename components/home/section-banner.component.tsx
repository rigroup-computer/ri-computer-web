import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "15k+", label: "Unit Terperbaiki" },
  { value: "4.9/5", label: "Rating Kepuasan" },
  { value: "50+", label: "Teknisi Ahli" },
] as const;

export default function SectionBannerComponent() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-72 md:h-96 lg:hidden">
        <div className="absolute left-0 bottom-0 z-10 w-full h-full bg-linear-to-t from-black/70 via-black/50 to-black/20"></div>
        <Image
          src="/images/assets/hero-banner.webp"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute z-20 inset-0 flex flex-col justify-end px-4 py-6">
          <span className="inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-white">
            Service Terpercaya
          </span>
          <h1 className="mt-3 text-balance text-2xl font-bold leading-tight text-white">
            Solusi Cepat &amp; Tepat untuk Laptop Anda
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Teknisi ahli siap menangani segala kerusakan dengan garansi resmi.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/booking"
              className="inline-flex min-h-8 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-xxs mobile-m:text-xs font-semibold text-white shadow-lg active:scale-[0.98]"
            >
              Booking Sekarang
            </Link>
            <Link
              href="#layanan"
              className="inline-flex min-h-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-xxs mobile-m:text-xs text-white backdrop-blur-md active:scale-[0.98]"
            >
              Layanan Kami
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden bg-linear-to-br from-[#f1f6fe] to-white px-4 py-16 lg:block">
        <div className="grid items-center gap-12 lg:grid-cols-2 max-w-7xl mx-auto">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <span className="text-xs font-bold text-primary">
                #1 Laptop Specialist
              </span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-mate-black">
              Solusi Cepat &amp; Tepat untuk{" "}
              <span className="text-primary">Laptop Kesayangan Anda.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#565d6d]">
              Teknisi ahli siap menangani segala kerusakan hardware dan software
              dengan garansi resmi hingga 90 hari.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/booking"
                className="inline-flex min-h-11 items-center justify-center gap-3 rounded-2xl bg-primary px-10 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 active:scale-[0.98]"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  fill="#ffffff"
                >
                  <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
                </svg>
                Booking Service Sekarang
              </Link>
              <Link
                href="#layanan"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#dee1e6] bg-white/50 px-10 py-4 text-sm font-bold text-mate-black backdrop-blur-md active:scale-[0.98]"
              >
                Lihat Layanan
              </Link>
            </div>
            <div className="mt-8 flex gap-12 border-t border-[#dee1e6]/50 pt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-mate-black">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#565d6d]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[40px] border-8 border-white shadow-2xl">
              <Image
                src="/images/assets/hero-desktop.webp"
                alt="Teknisi Ri Computer sedang memperbaiki laptop"
                width={600}
                height={500}
                className="h-[500px] w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
