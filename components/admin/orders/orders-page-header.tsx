import { Icon } from "@iconify/react";
import Link from "next/link";

import {
  ADMIN_SERVICE_TYPE_OPTIONS,
  type JenisQueryValue,
} from "@/lib/admin-order-status-display";

type OrdersPageHeaderProps = Readonly<{
  selectedJenis: JenisQueryValue[];
}>;

function selectedJenisLabel(selectedJenis: JenisQueryValue[]): string {
  return selectedJenis
    .map(
      (value) =>
        ADMIN_SERVICE_TYPE_OPTIONS.find((option) => option.value === value)
          ?.label ?? value,
    )
    .join(", ");
}

export function OrdersPageHeader({ selectedJenis }: OrdersPageHeaderProps) {
  return (
    <div className="flex items-center lg:hidden justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-lg hidden font-semibold text-[#171a1f] lg:text-lg">
          Daftar Pesanan
        </h1>
        {selectedJenis.length > 0 ? (
          <p className="mt-1 text-xs font-medium text-[#1a73e8]">
            Filter tipe layanan: {selectedJenisLabel(selectedJenis)}
          </p>
        ) : null}
      </div>

      <Link
        href="/admin/settings"
        className="hidden size-10 shrink-0 items-center justify-center rounded-md text-[#171a1f] transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40 lg:flex"
        aria-label="Pengaturan"
      >
        <Icon icon="mdi:cog-outline" width={24} height={24} aria-hidden />
      </Link>
    </div>
  );
}
