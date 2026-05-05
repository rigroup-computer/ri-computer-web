import type { Metadata } from "next";
import { BookingForm } from "@/components/forms/booking-form";

export const metadata: Metadata = {
  title: "Booking Servis Laptop",
  description:
    "Formulir Home Servis yang selaras guideline antarmuka aplikasi Ri Computer.",
};

export default function BookingPage() {
  return (
    <main className="bg-white px-4 pb-24 pt-4">
      <h1 className="text-xl font-bold text-slate-900">Booking Service</h1>
      <p className="mt-2 text-sm text-slate-600">
        Pilih layanan yang sesuai kebutuhan Anda.
      </p>
      <BookingForm />
    </main>
  );
}
