import { Icon } from "@iconify/react";
import Link from "next/link";

const NAV_LINKS = [
  {
    href: "/admin/orders",
    label: "Pesanan",
    icon: "mdi:clipboard-list-outline",
    className:
      "border border-[rgba(26,115,232,0.2)] bg-[#f1f6fe] text-[#171a1f]",
    iconClassName: "text-[#1a73e8]",
  },
  // Inventaris — re-enable when /admin/inventory console is ready.
] as const;

export function DashboardNavLinks() {
  return (
    <nav
      className="grid grid-cols-1 gap-2 lg:hidden"
      aria-label="Navigasi pesanan"
    >
      {NAV_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex h-[46px] items-center justify-center gap-2 rounded-[10px] text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40 ${item.className}`}
        >
          <Icon
            icon={item.icon}
            width={18}
            height={18}
            className={item.iconClassName}
            aria-hidden
          />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
