"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SvgBeranda, SvgBooking, SvgTracking } from "../shared/SvgComponent";

const menus = [
  { href: "/", label: "Beranda", icon: SvgBeranda },
  { href: "/booking", label: "Booking", icon: SvgBooking },
  { href: "/tracking", label: "Status", icon: SvgTracking },
];

export function BottomNav() {
  const pathname = usePathname();

  if (!pathname || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-md gap-6 border-t border-slate-200 bg-white px-8 py-2 shadow-[0_-6px_20px_-10px_rgb(148_163_184/35%)]">
      {menus.map((menu) => {
        const active = pathname === menu.href;

        return (
          <Link
            key={menu.href}
            href={menu.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 justify-center rounded-md py-1 text-xs ${
              active ? "bg-primary text-white" : "text-slate-600"
            }`}
          >
            <menu.icon className={`w-6 h-6 ${active ? "text-white" : "text-slate-600"}`} />
            <span>{menu.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
