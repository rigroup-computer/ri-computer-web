import { Icon } from "@iconify/react";
import Link from "next/link";

import { logoutAdmin } from "@/lib/actions/admin-auth";
import { whatsappHref } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  const shopWa = process.env.SHOP_WHATSAPP_NUMBER?.trim() ?? "";
  const waHref = shopWa ? whatsappHref(shopWa) : null;
  const shopAddress = process.env.SHOP_PUBLIC_ADDRESS?.trim() ?? "";
  const shopHours = process.env.SHOP_PUBLIC_HOURS?.trim() ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

  return (
    <main className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="text-xl font-bold text-mate-black">Pengaturan</h1>
        <p className="mt-1 text-sm text-mate-black/60">
          Informasi toko dan sesi admin
        </p>
      </header>

      <section className="rounded-2xl border border-[#DEDFE3] bg-white p-5 custom-shadow-sm">
        <h2 className="text-sm font-semibold text-mate-black">Sesi Admin</h2>
        <p className="mt-2 text-sm text-mate-black/60">
          Keluar dari konsol admin di perangkat ini.
        </p>
        <form action={logoutAdmin} className="mt-4">
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition active:scale-[0.98]"
          >
            <Icon icon="mdi:logout" width={20} height={20} aria-hidden />
            Keluar
          </button>
        </form>
      </section>

      <p className="text-center text-xs text-mate-black/45">
        Ri Computer · Konsol Admin
      </p>
    </main>
  );
}
