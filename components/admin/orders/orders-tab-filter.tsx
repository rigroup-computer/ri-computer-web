import Link from "next/link";

import { type OrdersStatusTab } from "@/lib/admin-order-status-display";

type OrdersTabFilterProps = Readonly<{
  activeTab: OrdersStatusTab;
  jenis?: string;
  hasServiceTypeFilter: boolean;
}>;

const TABS: ReadonlyArray<{ id: OrdersStatusTab; label: string }> = [
  { id: "semua", label: "Semua" },
  { id: "antrian", label: "Antrian" },
  { id: "proses", label: "Proses" },
  { id: "selesai", label: "Selesai" },
];

function tabHref(
  tab: OrdersStatusTab,
  jenis: string | undefined,
  hasServiceTypeFilter: boolean,
): string {
  const params = new URLSearchParams({ tab });
  if (hasServiceTypeFilter && jenis) {
    params.set("jenis", jenis);
  }
  return `/admin/orders?${params.toString()}`;
}

export function OrdersTabFilter({
  activeTab,
  jenis,
  hasServiceTypeFilter,
}: OrdersTabFilterProps) {
  return (
    <nav
      className="flex border-b border-[#dee1e6]"
      aria-label="Filter status pesanan"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tabHref(tab.id, jenis, hasServiceTypeFilter)}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={`min-h-11 flex-1 border-b-2 pb-2.5 pt-1 text-center text-sm transition-colors ${
              isActive
                ? "border-[#1a73e8] font-semibold text-[#1a73e8]"
                : "border-transparent font-medium text-[#565d6d]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
