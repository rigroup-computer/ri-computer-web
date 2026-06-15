export const ADMIN_NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
    spriteCol: 0,
  },
  {
    href: "/admin/orders",
    label: "Pesanan",
    pageTitle: "Daftar Pesanan",
    icon: "mdi:clipboard-list-outline",
    spriteCol: 1,
  },
  {
    href: "/admin/inventory",
    label: "Inventaris",
    pageTitle: "Inventaris & Titip Jual",
    icon: "mdi:laptop",
    spriteCol: 2,
  },
  {
    href: "/admin/settings",
    label: "Pengaturan",
    pageTitle: "Pengaturan",
    icon: "mdi:cog-outline",
    spriteCol: 3,
  },
] as const;

/** Sidebar & bottom nav — re-enable inventory when the console is ready. */
export const ADMIN_NAV_VISIBLE_ITEMS = ADMIN_NAV_ITEMS.filter(
  (item) => item.href !== "/admin/inventory",
);

export function adminPageTitle(pathname: string): string | null {
  for (const item of ADMIN_NAV_ITEMS) {
    if (!("pageTitle" in item) || !item.pageTitle) continue;
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item.pageTitle;
    }
  }
  return null;
}

export function linkActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
