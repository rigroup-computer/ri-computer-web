import { prisma } from "@/lib/prisma";
import {
  MarketHorizontalStrip,
  MarketPreviewItem,
  MarketSeeAllLink,
} from "./market-strip";
import { formatIdr } from "@/lib/format-idr";

export default async function SectionSellComponent() {
  const published = await prisma.inventoryItem.findMany({
    where: { isPublished: true },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  const marketItems: MarketPreviewItem[] = published.map((unit) => ({
    id: unit.id,
    title: unit.title,
    specs:
      unit.specs.length > 120 ? `${unit.specs.slice(0, 120)}…` : unit.specs,
    priceLabel: formatIdr(unit.price),
  }));

  const fallbacks =
    marketItems.length === 0
      ? [
          {
            id: "fallback",
            title: "ASUS VivoBook 14",
            specs: "Intel Core i5 · RAM 8 GB · SSD 512 GB · siap pakai",
            priceLabel: "Rp 5.500.000",
          } satisfies MarketPreviewItem,
        ]
      : [];

  const shopWa = process.env.SHOP_WHATSAPP_NUMBER ?? "";

  return (
    <section className="mt-16 px-4">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold text-mate-black">Laptop Dijual</h2>
        <MarketSeeAllLink />
      </div>

      <div className="mt-6">
        <MarketHorizontalStrip
          items={marketItems.length ? marketItems : fallbacks}
        />
      </div>

      {!shopWa.trim().length ? (
        <p className="mt-3 text-[11px] text-slate-500">
          Pasang nomor pusat Ri Computer dalam `.env → SHOP_WHATSAPP_NUMBER`
          supaya tautan konsultasi bisa aktif.
        </p>
      ) : null}
    </section>
  );
}
