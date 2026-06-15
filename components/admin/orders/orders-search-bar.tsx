"use client";

import { Icon } from "@iconify/react";

type OrdersSearchBarProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
}>;

export function OrdersSearchBar({ value, onChange }: OrdersSearchBarProps) {
  return (
    <label className="relative block">
      <span className="sr-only">Cari ID Pesanan atau Nama</span>
      <Icon
        icon="mdi:magnify"
        width={20}
        height={20}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#565d6d]"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Cari ID Pesanan atau Nama..."
        className="h-11 w-full rounded-full border-0 bg-[#f7f7f8] pl-11 pr-4 text-sm text-[#171a1f] placeholder:text-[#565d6d]/70 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1a73e8]"
      />
    </label>
  );
}
