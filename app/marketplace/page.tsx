import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MarketplaceInventoryCards, type ListedInventoryCard } from "@/components/marketplace/inventory-cards";
import { getShopWhatsAppNumber } from "@/lib/whatsapp";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Katalog Laptop — Titip Jual & Toko",
  description: "Lihat laptop titip jual dan unit milik Ri Computer. Hubungi Ri Computer lewat WhatsApp.",
};

export default async function MarketplacePage() {
  const shopWa = getShopWhatsAppNumber();

  const listings = await prisma.inventoryItem.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  const inventory: ListedInventoryCard[] = shopWa.length
    ? listings.map((item) => ({
        id: item.id,
        title: item.title,
        specs: item.specs,
        price: item.price,
        imageUrl: item.imageUrl,
        whatsappPhone: shopWa,
      }))
    : [];

  redirect("/");

  return (
    <main className="px-4 pb-28 pt-6">
      <h1 className="text-xl font-semibold">Katalog Laptop</h1>
      <p className="mt-1 text-sm text-slate-600">Unit titip jual dan inventaris resmi Ri Computer. Hubungi via WhatsApp untuk tanya unit.</p>
      <MarketplaceInventoryCards items={inventory} />
    </main>
  );
}
