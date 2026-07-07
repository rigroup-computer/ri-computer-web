import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Katalog Laptop — Titip Jual & Toko",
  description: "Lihat laptop titip jual dan unit milik Ri Computer. Hubungi Ri Computer lewat WhatsApp.",
};

export default function MarketplacePage() {
  redirect("/");
}
