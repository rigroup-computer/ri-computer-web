import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/forms/booking-form";
import { homeServiceWhatsAppHref } from "@/lib/booking-service-links";

export const metadata: Metadata = {
  title: "Booking Servis Laptop",
  description:
    "Formulir Home Servis yang selaras guideline antarmuka aplikasi Ri Computer.",
};

export default function BookingPage() {
  const homeServiceWaHref = homeServiceWhatsAppHref();

  return (
    <main className="bg-white px-4 pb-24 pt-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-slate-900">Booking Service</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pilih layanan yang sesuai kebutuhan Anda.
        </p>
        <Suspense
          fallback={
            <p className="mt-10 text-sm text-slate-500">Memuat formulir…</p>
          }
        >
          <BookingForm homeServiceWaHref={homeServiceWaHref} />
        </Suspense>
      </div>
    </main>
  );
}
