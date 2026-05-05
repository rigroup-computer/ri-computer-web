import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MarketplaceInventoryCards, type ListedInventoryCard } from "@/components/marketplace/inventory-cards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Katalog Laptop — Titip Jual & Toko",
  description: "Lihat laptop titip jual dan unit milik Ri Computer. Hubungi langsung pemilik atau toko lewat WhatsApp.",
};

export default async function MarketplacePage() {
  const shopWa = process.env.SHOP_WHATSAPP_NUMBER?.trim() ?? "";

  const listings = await prisma.inventoryItem.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  const filtered = listings.filter((item) => {
    if (item.isConsignment) {
      return Boolean((item.ownerContact ?? "").trim().length);
    }
    return shopWa.length > 0;
  });

  const inventory: ListedInventoryCard[] = filtered.map((item) => ({
    id: item.id,
    title: item.title,
    specs: item.specs,
    price: item.price,
    imageUrl: item.imageUrl,
    whatsappPhone: item.isConsignment ? (item.ownerContact ?? "").trim() : shopWa,
  }));

  return (
    <main className="px-4 pb-28 pt-6">
      <h1 className="text-xl font-semibold">Katalog Laptop</h1>
      <p className="mt-1 text-sm text-slate-600">Unit titip jual dan inventaris resmi Ri Computer Kontak WhatsApp akan mengarah ke pemilik atau toko sesuai sumber listing.</p>
      <MarketplaceInventoryCards items={inventory} />
    </main>
  );
}
