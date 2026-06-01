"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsClient } from "@/lib/use-is-client";
import { SvgBeranda, SvgBooking, SvgTracking } from "../shared/SvgComponent";

const menus = [
  { href: "/", label: "Beranda", icon: SvgBeranda },
  { href: "/booking", label: "Booking", icon: SvgBooking },
  { href: "/tracking", label: "Status", icon: SvgTracking },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const isClient = useIsClient();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-md gap-6 border-t border-slate-200 bg-white px-8 py-2 shadow-[0_-6px_20px_-10px_rgb(148_163_184/35%)] lg:hidden">
      {menus.map((item) => {
        const Icon = item.icon;
        const active = isClient && pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md py-1 text-xs ${
              active ? "font-semibold text-[#1A73E8]" : "font-normal text-mate-black"
            }`}
          >
            <Icon
              className={`h-6 w-6 ${active ? "text-[#1A73E8]" : "text-[#5A5F68]"}`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
