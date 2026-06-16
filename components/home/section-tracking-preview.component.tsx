import Image from "next/image";
import Link from "next/link";

export default function SectionTrackingPreviewComponent() {
  return (
    <div className="relative flex flex-col justify-center overflow-hidden rounded-[40px] bg-[#fafafb] p-8">
      <Image
        src="/images/assets/IMG_14.svg"
        alt=""
        width={64}
        height={64}
        aria-hidden
        className="absolute right-8 top-8 opacity-10"
      />

      <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#DCFCE7] px-4 py-2">
        <span className="size-2 animate-pulse rounded-full bg-[#22C55E]" />
        <span className="text-sm font-bold text-[#15803D]">Live Repair Status</span>
      </div>

      <h3 className="mb-4 text-2xl font-bold text-mate-black">
        Pantau Perbaikan Secara Real-Time
      </h3>
      <p className="mb-8 text-sm leading-relaxed text-[#565d6d]">
        Dengan fitur tracking Ri Group Computer, Anda bisa melihat setiap tahap perbaikan
        laptop langsung dari aplikasi kami.
      </p>

      <div className="custom-shadow-md rounded-xl border border-gray-100 bg-white p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-mate-black">Order #RC-2024-001</span>
          <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-[10px] font-bold text-primary-dark">
            Tahap: Penggantian LCD
          </span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
          <div className="h-full w-3/4 rounded-full bg-primary" />
        </div>
        <p className="text-[10px] italic text-[#565d6d]">
          Teknisi sedang memasang panel original. Estimasi selesai: 14:30 WIB
        </p>
      </div>

      <Link
        href="/tracking"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white active:scale-[0.98]"
      >
        Cek Status Servis
      </Link>
    </div>
  );
}
