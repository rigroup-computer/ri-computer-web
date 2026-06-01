import Image from "next/image";
import Link from "next/link";

export type MarketPreviewItem = {
  id: string;
  title: string;
  specs: string;
  priceLabel: string;
  imageUrl?: string | null;
  isNew?: boolean;
};

export function MarketHorizontalStrip({
  comingSoon = false,
  items,
}: {
  comingSoon?: boolean;
  items: MarketPreviewItem[];
}) {
  if (!items.length) {
    return (
      <p className="text-center text-xs text-slate-500">
        Belum ada laptop dipublikasikan.
      </p>
    );
  }

  return (
    <div className="scrollbar-hide overflow-x-auto lg:flex lg:h-full lg:w-8/12 lg:min-h-0 lg:flex-col">
      <div className="flex w-max gap-3 lg:grid lg:h-full lg:w-full lg:grid-cols-2 lg:gap-10">
        {items.map((item) => (
          <article
            key={item.id}
            className="relative custom-shadow-sm first:ml-3 lg:first:ml-0 lg:last:mr-0 last:mr-3 w-[170px] shrink-0 overflow-hidden rounded-xl border border-[#DEDFE3] bg-white transition-shadow hover:shadow-lg md:w-[240px] lg:w-full"
          >
            <div className="absolute z-10 top-0 right-0 bg-[#1A73E8FF] px-2 py-0.5 text-3xs lg:text-xs font-bold text-white">
              Coming Soon
            </div>
            <div className="relative h-28 bg-[#F4F4F6] md:h-40 lg:h-56 lg:w-full">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className={`object-cover ${comingSoon ? "grayscale" : ""}`}
                  sizes="240px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">
                  💻
                </div>
              )}
              {item.isNew ? (
                <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[9px] font-bold text-mate-black">
                  Baru
                </span>
              ) : null}
            </div>
            <div className="p-3">
              <p className="mb-1 truncate text-[10px] lg:text-xs font-medium uppercase text-[#5A5F68]">
                {item.specs}
              </p>
              <h3 className="mb-1 truncate text-sm lg:text-base font-bold text-mate-black">
                {item.title}
              </h3>

              {/* Hide Price */}
              {/* <p className="mb-3 text-sm font-bold text-primary">{item.priceLabel}</p> */}

              {/* Hide Button Detail */}
              {/* <Link
              href="/marketplace"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#F4F4F6] text-[11px] font-bold text-[#353940] hover:bg-gray-200 active:scale-[0.98]"
            >
              Lihat Detail
            </Link> */}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function MarketSeeAllLink() {
  return (
    <Link
      href="/marketplace"
      className="inline-flex min-h-11 items-center text-xs font-semibold text-primary hover:underline md:text-sm"
    >
      Cek Stok
    </Link>
  );
}
