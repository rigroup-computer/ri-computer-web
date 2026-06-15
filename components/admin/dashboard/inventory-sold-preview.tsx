import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

import type { AdminDashboardInventoryPreview } from "@/lib/admin-dashboard-stats";

type InventorySoldPreviewProps = Readonly<{
  items: AdminDashboardInventoryPreview[];
}>;

export function InventorySoldPreview({ items }: InventorySoldPreviewProps) {
  const preview = items.slice(0, 2);

  return (
    <section
      className="hidden rounded-[10px] bg-white p-4 custom-shadow-sm lg:block"
      aria-labelledby="inventory-sold-heading"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2
          id="inventory-sold-heading"
          className="text-sm font-bold text-[#171a1f]"
        >
          Unit Terjual
        </h2>
        <span className="rounded-full bg-[#f1f6fe] px-2 py-0.5 text-2xs font-semibold text-[#1a73e8]">
          Coming Soon
        </span>
      </div>

      {preview.length === 0 ? (
        <p className="text-xs text-[#565d6d]">Belum ada unit untuk ditampilkan.</p>
      ) : (
        <div className="grid gap-3">
          {preview.map((item) => (
            <Link
              key={item.id}
              href="/admin/inventory"
              className="relative h-[180px] overflow-hidden rounded-[10px]"
            >
              <div className="relative size-full bg-slate-800">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover opacity-85"
                    sizes="280px"
                    unoptimized
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-white/25">
                    <Icon icon="mdi:laptop" width={40} height={40} aria-hidden />
                  </span>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/75 to-transparent" />
                <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/95 px-2.5 py-0.5 text-2xs font-semibold text-[#171a1f]">
                  Coming Soon
                </span>
                <p className="absolute inset-x-3 bottom-3 truncate text-xs font-semibold text-white">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
