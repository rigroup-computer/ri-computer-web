import type { Metadata } from "next";
import { TrackingLookup } from "@/components/tracking/tracking-lookup";

export const metadata: Metadata = {
  title: "Status Servis Laptop",
  description: "Pantau progres riparasi menggunakan Tracking ID atau nomor WhatsApp yang terdaftar.",
};

export default function TrackingPage() {
  const shopWaRaw = process.env.SHOP_WHATSAPP_NUMBER ?? "";
  const shopWhatsApp = shopWaRaw.trim();

  return (
    <main className="bg-slate-50 px-4 pt-4">
      <h1 className="text-xl font-bold text-slate-900">Status Service</h1>
      <p className="mt-1 text-sm text-slate-600">Pantau status perbaikan laptop Anda.</p>
      <TrackingLookup shopWhatsApp={shopWhatsApp || undefined} />
    </main>
  );
}
