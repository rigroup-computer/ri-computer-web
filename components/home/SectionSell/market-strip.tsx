import Link from "next/link";

export type MarketPreviewItem = {
  id: string;
  title: string;
  specs: string;
  priceLabel: string;
};

export function MarketHorizontalStrip({ items }: { items: MarketPreviewItem[] }) {
  if (!items.length) {
    return <p className="text-center text-xs text-slate-500">Belum ada laptop dipublikasikan.</p>;
  }

  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1">
      {items.map((item) => (
        <div key={item.id} className="w-52 shrink-0 rounded-md bg-white shadow-sm">
          <div className="flex aspect-4/3 items-center justify-center rounded-t-md bg-linear-to-b from-[#f7f7f7] to-transparent text-xl text-white">
            💻
          </div>
          <div className="space-y-2 p-3">
            <p className="text-sm font-semibold leading-snug text-mate-black">{item.title}</p>
            <p className="line-clamp-2 text-xs text-mate-black/70">{item.specs}</p>
            <p className="text-sm mt-4 font-semibold text-mate-black">{item.priceLabel}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketSeeAllLink() {
  return (
    <div className="mt-4 text-center">
      <Link href="/marketplace" className="text-sm font-semibold text-blue-600 hover:underline">
        Lihat Semua →
      </Link>
    </div>
  );
}
