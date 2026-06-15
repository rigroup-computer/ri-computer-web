import Image from "next/image";
import Link from "next/link";

export default function SectionBannerComponent() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#F6F9FF] via-[#F6F9FF] to-[#f6f9ff00] px-4 pb-28 pt-6 text-white">
      <Image
        src="/images/assets/laptop.png"
        alt=""
        width={200}
        height={200}
        aria-hidden
        className="pointer-events-none absolute right-3 bottom-10"
      />

      <h1 className="mt-2 text-mate-black text-5xl font-bold tracking-tight">
        Ri <span className="text-primary text-2xl">Computer</span>
      </h1>
      <p className="mt-3 max-w-sm text-sm font-medium text-mate-black/70">
        Solusi Terbaik untuk <br /> Laptop Anda
      </p>

      <div className="mt-3 items-center gap-4">
        <Link
          href="/booking"
          className="inline-flex min-h-10 px-4 text-sm items-center justify-center rounded-sm bg-primary text-white"
        >
          Booking Sekarang
        </Link>
        {/* <div className="hidden h-[150px] w-[120px] sm:block relative">
          <div className="absolute inset-x-[-12px] bottom-[-6px] h-[160px] rounded-[40px] border border-black/65 bg-black/92 p-[7px] shadow-2xl">
            <div className="h-full rounded-[34px] border border-black/85 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,1),transparent_62%),linear-gradient(to_bottom,#3b536a,#071021)] opacity-92" />
          </div>
        </div> */}
      </div>
    </section>
  );
}
