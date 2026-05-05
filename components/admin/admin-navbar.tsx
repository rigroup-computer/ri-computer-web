"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/lib/actions/admin-auth";

const ITEMS = [
  { href: "/admin", label: "Dasbor" },
  { href: "/admin/orders", label: "Order" },
  { href: "/admin/inventory", label: "Inventaris" },
] as const;

function linkActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Bar atas: logo + keluar (tetap di atas konten) */
export function AdminHeader() {
  return (
    <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-4">
      <Link
        href="/admin"
        className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none ring-white/40 focus-visible:ring-2"
      >
        <span className="text-3xl leading-none text-white">
          R<span className="text-orange-400">i</span>
        </span>
        <span className="flex min-w-0 flex-col leading-tight text-white">
          <span className="truncate text-sm font-semibold">Ri Computer</span>
          <span className="text-[11px] font-medium text-white/75">Admin</span>
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative size-9 overflow-hidden rounded-full border border-white/20 bg-white/10">
          <Image
            src="/icons/png/profile.png"
            alt="Profil"
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        </div>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="touch-manipulation rounded-full border border-red-300/60 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/25 sm:text-sm"
          >
            Keluar
          </button>
        </form>
      </div>
    </div>
  );
}

/** Navbar admin — mengikuti pola BottomNav publik: fixed, max-w-md, centered */
export function AdminBottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 border-t border-white/15 bg-[#244673] shadow-[0_-8px_28px_-6px_rgba(0,0,0,0.2)]"
      aria-label="Navigasi admin"
    >
      <ul className="flex w-full items-stretch gap-1 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3">
        {ITEMS.map(({ href, label }) => {
          const active = linkActive(href, pathname);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[52px] w-full touch-manipulation flex-col items-center justify-center rounded-xl px-1 text-center text-[11px] font-semibold leading-tight transition-colors sm:text-xs ${
                  active
                    ? "bg-white text-[#244673] shadow-sm"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
