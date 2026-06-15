import { Icon } from "@iconify/react";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="mb-6 hidden items-center justify-between lg:flex">
      <h1 className="text-xl font-bold text-mate-black">Dashboard Ringkasan</h1>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-[#dedfe3] bg-white text-[#565d6d] transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40"
          aria-label="Notifikasi"
        >
          <Icon icon="mdi:bell-outline" width={22} height={22} aria-hidden />
        </button>
        <Link
          href="/admin/settings"
          className="flex size-10 items-center justify-center rounded-full border border-[#dedfe3] bg-white text-[#565d6d] transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40"
          aria-label="Pengaturan"
        >
          <Icon icon="mdi:cog-outline" width={22} height={22} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
