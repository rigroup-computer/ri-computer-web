import { prisma } from "@/lib/prisma";
import {
  MarketHorizontalStrip,
  MarketPreviewItem,
  MarketSeeAllLink,
} from "./market-strip";
import { formatIdr } from "@/lib/format-idr";
import Link from "next/link";

const dummyItems: MarketPreviewItem[] = [
  {
    id: "fallback-1",
    title: "MacBook Pro M2",
    specs: "8GB / 256GB SSD",
    priceLabel: "Rp 18.499.000",
    imageUrl: "/images/assets/IMG_10.webp",
    // isNew: true,
  },
  {
    id: "fallback-2",
    title: "ROG Zephyrus",
    specs: "RTX 4060 / 1TB",
    priceLabel: "Rp 22.999.000",
    imageUrl: "/images/assets/IMG_11.webp",
  },
  {
    id: "fallback-3",
    title: "Dell XPS 13",
    specs: "i7 / 16GB RAM",
    priceLabel: "Rp 16.250.000",
    imageUrl: "/images/assets/IMG_12.webp",
    // isNew: true,
  },

  {
    id: "fallback-4",
    title: "ThinkPad X1",
    specs: "Carbon Gen 10",
    priceLabel: "Rp 19.800.000",
    imageUrl: "/images/assets/IMG_10.webp",
    // isNew: true,
  },
];

export default async function SectionSellComponent() {
  const published = await prisma.inventoryItem.findMany({
    where: { isPublished: true },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  const marketItems: MarketPreviewItem[] = published.map((unit, index) => ({
    id: unit.id,
    title: unit.title,
    specs: unit.specs.length > 48 ? `${unit.specs.slice(0, 48)}…` : unit.specs,
    priceLabel: formatIdr(unit.price),
    imageUrl: unit.imageUrl,
    isNew: index === 0,
  }));

  // ===== Activated Later =====
  // const fallbacks: MarketPreviewItem[] =
  //   marketItems.length === 0 ? dummyItems : [];
  // const isInventoryEmpty = marketItems.length === 0;
  // const inventoryItems = isInventoryEmpty ? fallbacks : marketItems;
  // ==========================

  const inventoryItems = dummyItems;

  return (
    <section
      id="produk"
      className="pb-8 lg:max-w-7xl lg:mx-auto lg:px-0 lg:pb-16"
    >
      <div className="mb-2 lg:mb-6 flex items-center justify-between px-4 lg:px-0">
        <div className="">
          <div className="hidden lg:inline-flex items-center rounded-full bg-primary/5 px-4 py-1.5">
            <span className="text-xs font-bold text-primary">Produk</span>
          </div>
          <h2 className="text-lg font-bold text-mate-black md:text-2xl">
            Laptop Pilihan Kami
          </h2>
          <p className="text-xs hidden lg:block lg:mt-2 text-[#5A5F68] md:text-sm">
            Nantikan koleksi unit berkualitas tinggi kami yang akan segera
            hadir.
          </p>
        </div>
        {/* ===== Activated Later ===== */}
        {/* <MarketSeeAllLink /> */}
      </div>

      <div className="lg:flex lg:items-stretch lg:gap-20">
        <MarketHorizontalStrip comingSoon items={inventoryItems} />

        <div className="hidden lg:flex lg:w-4/12 lg:min-h-0 lg:flex-col rounded-xl bg-[#1A73E8FF] p-8">
          <div className="inline-flex w-fit items-center rounded-full bg-[#488FED] px-4 py-1.5">
            <span className="text-xs font-bold text-white">Promo Terbatas</span>
          </div>
          <h3 className="mt-4 text-xl font-bold leading-tight text-white xl:text-5xl">
            Dapatkan Penawaran Eksklusif di Website Kami
          </h3>
          <p className="mt-3 text-white/80">
            Nantikan koleksi unit berkualitas tinggi kami yang akan segera
            hadir.
          </p>
          <Link
            href="#"
            className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-6 text-xs font-semibold text-primary hover:bg-gray-200 md:text-sm"
          >
            Segera Hadir
          </Link>
        </div>
      </div>
    </section>
  );
}
