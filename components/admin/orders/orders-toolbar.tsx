"use client";

import Link from "next/link";
import { FilterComponent } from "@/components/shared/filter-component";
import { OrdersServiceTypeFilter } from "@/components/admin/orders/orders-service-type-filter";
import {
  buildAdminOrdersPageHref,
  type JenisQueryValue,
  type OrdersStatusTab,
} from "@/lib/admin-order-status-display";

type OrdersToolbarProps = Readonly<{
  onDebouncedSearchChange: (value: string) => void;
  activeTab: OrdersStatusTab;
  selectedJenis: JenisQueryValue[];
}>;

const TABS: ReadonlyArray<{ id: OrdersStatusTab; label: string }> = [
  { id: "semua", label: "Semua" },
  { id: "antrian", label: "Antrian" },
  { id: "proses", label: "Proses" },
  { id: "selesai", label: "Selesai" },
];

function StatusTabs({
  activeTab,
  selectedJenis,
}: Readonly<{
  activeTab: OrdersStatusTab;
  selectedJenis: JenisQueryValue[];
}>) {
  return (
    <>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={buildAdminOrdersPageHref(tab.id, selectedJenis)}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={`relative min-h-11 flex-1 text-center text-sm font-medium transition-colors lg:min-h-8 lg:flex-none lg:rounded-md lg:px-4 lg:py-1.5 lg:text-sm ${
              isActive
                ? "text-[#1a73e8] lg:bg-white lg:text-[#171a1f] lg:shadow-sm"
                : "text-[#565d6d] lg:text-[#565d6d] lg:hover:text-[#171a1f]"
            }`}
          >
            <span
              className={`flex h-full items-center justify-center lg:block lg:h-auto lg:py-0 ${
                isActive
                  ? "border-b-2 border-[#1a73e8] bg-[#1a73e8]/5 lg:border-0 lg:bg-transparent"
                  : "border-b-2 border-transparent lg:border-0"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </>
  );
}

export function OrdersToolbar({
  onDebouncedSearchChange,
  activeTab,
  selectedJenis,
}: OrdersToolbarProps) {
  return (
    <section
      className="-mx-4 sticky top-0 z-10 lg:top-8 border-b border-[#dee1e6] bg-white/95 px-4 pb-5 backdrop-blur-sm lg:mx-0 lg:rounded-2xl lg:border lg:bg-white lg:p-[17px] lg:shadow-[0_1px_2.19px_0_rgba(23,26,31,0.07),0_0_1.75px_0_rgba(23,26,31,0.08)]"
      aria-label="Cari dan filter pesanan"
    >
      <div className="flex flex-col-reverse gap-3 lg:flex-col lg:justify-between lg:gap-4">
        <div className="flex flex-col gap-3 lg:justify-between lg:flex-row items-start lg:items-center lg:gap-4">
          <div className="flex w-full flex-col lg:flex-row min-w-0 items-stretch lg:items-center gap-2">
            <span className="shrink-0 text-sm font-medium text-[#565d6d]">
              Status:
            </span>
            <nav
              className="flex w-full min-w-0 flex-1 lg:w-auto lg:rounded-[10px] lg:bg-[#f3f4f6] lg:p-1"
              aria-label="Filter status pesanan"
            >
              <StatusTabs activeTab={activeTab} selectedJenis={selectedJenis} />
            </nav>
          </div>

          <div className="relative flex items-center gap-2 lg:shrink-0">
            <span className="shrink-0 text-sm font-medium text-[#565d6d]">
              Tipe Layanan:
            </span>
            <OrdersServiceTypeFilter
              activeTab={activeTab}
              selectedJenis={selectedJenis}
              className="relative min-w-0 flex-1 lg:flex-none"
            />
          </div>
        </div>

        <div className="flex w-full items-center gap-3">
          <FilterComponent
            placeholder="Cari ID Pesanan atau Nama..."
            inputId="q"
            onDebouncedChange={onDebouncedSearchChange}
            fullWidth
            className="flex w-full min-w-0 items-center gap-3"
          />

          {/* <button
            type="button"
            className="hidden size-10 shrink-0 items-center justify-center rounded-md border border-[#dee1e6] bg-white text-[#171a1f] lg:flex"
            aria-label="Filter lanjutan"
            disabled
          >
            <Icon
              icon="mdi:filter-outline"
              width={18}
              height={18}
              aria-hidden
            />
          </button> */}
        </div>
      </div>
    </section>
  );
}
