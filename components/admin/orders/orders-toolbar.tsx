"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";
import { type OrdersStatusTab } from "@/lib/admin-order-status-display";

type OrdersToolbarProps = Readonly<{
  searchQuery: string;
  onSearchChange: (value: string) => void;
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

function StatusTabs({
  activeTab,
  jenis,
  hasServiceTypeFilter,
}: Readonly<{
  activeTab: OrdersStatusTab;
  jenis?: string;
  hasServiceTypeFilter: boolean;
}>) {
  return (
    <>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tabHref(tab.id, jenis, hasServiceTypeFilter)}
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
  searchQuery,
  onSearchChange,
  activeTab,
  jenis,
  hasServiceTypeFilter,
}: OrdersToolbarProps) {
  return (
    <section
      className="-mx-4 sticky top-0 z-10 lg:top-8 border-b border-[#dee1e6] bg-white/95 px-4 pb-0 backdrop-blur-sm lg:mx-0 lg:rounded-2xl lg:border lg:bg-white lg:p-[17px] lg:shadow-[0_1px_2.19px_0_rgba(23,26,31,0.07),0_0_1.75px_0_rgba(23,26,31,0.08)]"
      aria-label="Cari dan filter pesanan"
    >
      {/* <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4"> */}
      <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <nav
          className="flex lg:rounded-[10px] lg:bg-[#f3f4f6] lg:p-1"
          aria-label="Filter status pesanan"
        >
          <StatusTabs
            activeTab={activeTab}
            jenis={jenis}
            hasServiceTypeFilter={hasServiceTypeFilter}
          />
        </nav>

        <div className="flex items-center gap-3 lg:order-2">
          <label className="relative block min-w-0 flex-1 lg:w-[319px] lg:flex-none">
            <span className="sr-only">Cari ID Pesanan atau Nama</span>
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2">
              <Image
                src="/icons/ic-search.svg"
                alt="Search"
                width={18}
                height={18}
                className="text-[#565d6d]"
              />
            </span>
            <input
              id="q"
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari ID Pesanan atau Nama..."
              className="relative h-11 w-full rounded-[10px] border-0 bg-[#FAFAFB] pl-10 pr-4 text-sm text-[#171a1f] placeholder:text-[#565d6d] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#b1b1b1] lg:h-[39px] lg:rounded-md lg:border lg:border-[#dee1e6] lg:bg-white"
            />
          </label>

          <button
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
          </button>
        </div>
      </div>
    </section>
  );
}
