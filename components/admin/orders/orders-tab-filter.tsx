import Link from "next/link";

import {
  buildAdminOrdersPageHref,
  type JenisQueryValue,
  type OrdersStatusTab,
} from "@/lib/admin-order-status-display";

type OrdersTabFilterProps = Readonly<{
  activeTab: OrdersStatusTab;
  selectedJenis: JenisQueryValue[];
}>;

const TABS: ReadonlyArray<{ id: OrdersStatusTab; label: string }> = [
  { id: "semua", label: "Semua" },
  { id: "antrian", label: "Antrian" },
  { id: "proses", label: "Proses" },
  { id: "selesai", label: "Selesai" },
];

export function OrdersTabFilter({
  activeTab,
  selectedJenis,
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
            href={buildAdminOrdersPageHref(tab.id, selectedJenis)}
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
