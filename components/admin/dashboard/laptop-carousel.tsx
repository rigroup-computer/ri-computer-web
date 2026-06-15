import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

import type { AdminDashboardInventoryPreview } from "@/lib/admin-dashboard-stats";

type LaptopCarouselProps = Readonly<{
  items: AdminDashboardInventoryPreview[];
}>;

export function LaptopCarousel({ items }: LaptopCarouselProps) {
  return (
    <section aria-labelledby="laptop-carousel-heading" className="lg:hidden">
      <div className="mb-1">
        <h2
          id="laptop-carousel-heading"
          className="text-lg font-bold text-[#171a1f]"
        >
          Laptop Dijual
        </h2>
        <p className="text-xs italic text-[#565d6d]">
          *Unit akan segera tersedia
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-[#dee1e6] px-4 py-8 text-center text-sm text-[#565d6d]">
          Belum ada laptop di inventaris.
        </p>
      ) : (
        <div className="hide-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href="/admin/inventory"
              className="relative h-[140px] w-[200px] shrink-0 snap-start overflow-hidden rounded-xl custom-shadow-sm"
            >
              <div className="relative size-full bg-slate-800">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover opacity-80"
                    sizes="200px"
                    unoptimized
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-white/30">
                    <Icon icon="mdi:laptop" width={48} height={48} aria-hidden />
                  </span>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-[#1a73e8] px-3 py-1 text-2xs font-semibold text-white">
                  Coming Soon
                </span>
                <p className="absolute inset-x-3 bottom-3 truncate text-sm font-semibold text-white">
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
