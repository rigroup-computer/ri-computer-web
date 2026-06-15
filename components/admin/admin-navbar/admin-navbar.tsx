"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./admin-navbar-style.css";

import {
  ADMIN_NAV_VISIBLE_ITEMS,
  adminPageTitle,
  linkActive,
} from "@/components/admin/admin-nav-config";

const SPRITE_COL_CLASS = [
  "icon-bundle--c0",
  "icon-bundle--c1",
  "icon-bundle--c2",
  "icon-bundle--c3",
] as const;

/** Bar atas mobile: ringan, tanpa logout (ada di Pengaturan). */
export function AdminHeader() {
  const pathname = usePathname() ?? "";
  const isDashboard =
    pathname === "/admin" || pathname === "/admin/";
  const pageTitle = adminPageTitle(pathname);

  return (
    <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3.5">
      {isDashboard ? (
        <Link
          href="/admin"
          className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className="text-2xl font-bold leading-none text-primary">
            <Image
              src="/images/brand/icon-brand.png"
              alt="Logo Ri Computer"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-mate-black">
              Ri Computer
            </span>
            <span className="text-[11px] font-medium text-mate-black/55">
              Admin
            </span>
          </span>
        </Link>
      ) : (
        <h1 className="min-w-0 truncate text-sm font-semibold text-mate-black">
          {pageTitle ?? "Admin"}
        </h1>
      )}

      <div className="relative size-6 shrink-0 overflow-hidden">
        <Image
          src="/icons/ic-settings.svg"
          alt="Settings"
          fill
        />
      </div>
    </div>
  );
}

/** Bottom nav mobile — 4 tab, pola publik (putih). */
export function AdminBottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-lg border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-6px_20px_-10px_rgb(148_163_184/35%)] pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
      aria-label="Navigasi admin"
    >
      <ul className="flex w-full items-stretch gap-0.5">
        {ADMIN_NAV_VISIBLE_ITEMS.map(({ href, label, spriteCol }) => {
          const active = linkActive(href, pathname);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[52px] w-full touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-center text-[10px] font-semibold leading-tight transition-colors sm:text-[11px] ${
                  active
                    ? "text-primary"
                    : "text-mate-black/60 hover:text-mate-black"
                }`}
              >
                <span
                  aria-hidden
                  className={[
                    "icon-bundle",
                    SPRITE_COL_CLASS[spriteCol],
                    active ? "icon-bundle--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
