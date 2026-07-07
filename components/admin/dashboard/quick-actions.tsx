import { Icon } from "@iconify/react";
import Link from "next/link";

const ACTIONS = [
  {
    href: "/admin/orders?jenis=store",
    mobileLabel: "Periksa Store",
    title: "Datang ke Toko",
    subtitle: "Pesanan walk-in & servis di toko",
    icon: "mdi:store-outline",
  },
  {
    href: "/admin/orders?jenis=delivery",
    mobileLabel: "Periksa Delivery",
    title: "Antar Jemput",
    subtitle: "Kurir pickup & pengantaran unit",
    icon: "mdi:truck-delivery-outline",
  },
  {
    href: "/admin/orders?jenis=home",
    mobileLabel: "Periksa Home",
    title: "Home Service",
    subtitle: "Teknisi kunjungan ke lokasi pelanggan",
    icon: "mdi:home-account",
  },
] as const;

export function QuickActions() {
  return (
    <>
      <section
        aria-labelledby="admin-quick-actions-mobile"
        className="lg:hidden"
      >
        <h2 id="admin-quick-actions-mobile" className="sr-only">
          Aksi cepat
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex h-[77px] touch-manipulation flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#1a73e8] px-2 text-center text-xs font-bold leading-tight text-white transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/50 focus-visible:ring-offset-2"
            >
              <Icon icon={action.icon} width={22} height={22} aria-hidden />
              {action.mobileLabel}
            </Link>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="admin-quick-actions-desktop"
        className="hidden lg:block"
      >
        <h2
          id="admin-quick-actions-desktop"
          className="text-base font-bold text-mate-black"
        >
          Aksi Cepat
        </h2>
        <p className="mt-0.5 text-sm text-[#565d6d]">Prioritas hari ini</p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex min-h-[108px] items-center gap-3 rounded-2xl border border-[#dedfe3] bg-white p-4 custom-shadow-sm transition hover:border-[#1a73e8]/30 hover:bg-slate-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f6fe] text-[#1a73e8]">
                <Icon icon={action.icon} width={24} height={24} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-mate-black">
                  {action.title}
                </span>
                <span className="mt-1 block text-xs leading-snug text-[#565d6d]">
                  {action.subtitle}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
