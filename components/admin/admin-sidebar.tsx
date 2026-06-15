"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ADMIN_NAV_VISIBLE_ITEMS,
  linkActive,
} from "@/components/admin/admin-nav-config";

export function AdminSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-64 flex-col border-r border-slate-200/80 bg-white lg:flex">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-100 px-5">
        <Image
          src="/images/brand/icon-brand.png"
          alt="Logo Ri Computer"
          width={28}
          height={28}
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-mate-black">
            Ri Computer
          </p>
          <p className="text-xs text-mate-black/55">Konsol Admin</p>
        </div>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label="Navigasi admin desktop"
      >
        {ADMIN_NAV_VISIBLE_ITEMS.map(({ href, label, icon }) => {
          const active = linkActive(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary-dark"
                  : "text-mate-black/70 hover:bg-slate-50 hover:text-mate-black"
              }`}
            >
              <Icon icon={icon} width={22} height={22} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
            <Image
              src="/icons/png/profile.png"
              alt="Profil admin"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-mate-black">
              Admin
            </p>
            <p className="text-xs text-mate-black/55">Ri Computer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
