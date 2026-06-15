import type { Metadata } from "next";
import { TrackingLookup } from "@/components/tracking/tracking-lookup";

export const metadata: Metadata = {
  title: "Status Servis Laptop",
  description:
    "Pantau progres riparasi menggunakan Tracking ID atau nomor WhatsApp yang terdaftar.",
};

export default function TrackingPage() {
  const shopWaRaw = process.env.SHOP_WHATSAPP_NUMBER ?? "";
  const shopWhatsApp = shopWaRaw.trim();

  return (
    <main className="bg-white px-4 pt-4 lg:pt-16">
      <div className="lg:max-w-4xl lg:mx-auto">
        <h1 className="text-xl font-bold text-slate-900">
          Cek Status Laptop Anda
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Masukkan nomor service yang tertera pada nota atau pesan WhatsApp Anda
          untuk melihat progress perbaikan.
        </p>
        <TrackingLookup shopWhatsApp={shopWhatsApp || undefined} />
      </div>
    </main>
  );
}
