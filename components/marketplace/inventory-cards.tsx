import Image from "next/image";
import { whatsappHref } from "@/lib/whatsapp";
import { formatIdr } from "@/lib/format-idr";

export type ListedInventoryCard = {
  id: string;
  title: string;
  specs: string;
  price: bigint;
  imageUrl?: string | null;
  whatsappPhone: string;
};

export function MarketplaceInventoryCards({ items }: { items: ListedInventoryCard[] }) {
  if (!items.length) {
    return <p className="text-sm text-slate-600">Belum ada unit yang dipublikasikan. Cek lagi nanti.</p>;
  }

  return (
    <div className="mt-4 grid gap-4">
      {items.map((item) => {
        const message = `Halo, saya tertarik dengan listing:\n${item.title}\nharga ${formatIdr(item.price)}`;
        const href = whatsappHref(item.whatsappPhone, message);

        return (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-44 w-full bg-slate-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 448px) 100vw, 448px"
                  className="object-cover"
                  unoptimized
                  priority={false}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">Tanpa foto</div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div>
                <h2 className="text-base font-semibold">{item.title}</h2>
                <p className="text-sm font-medium text-slate-800">{formatIdr(item.price)}</p>
              </div>
              <p className="text-sm text-slate-700">{item.specs}</p>
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center rounded-sm bg-blue-600 text-sm font-medium text-white shadow-sm">
                  Hubungi via WhatsApp
                </a>
              ) : (
                <p className="text-xs text-red-600">Nomor WhatsApp untuk listing ini tidak valid.</p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
