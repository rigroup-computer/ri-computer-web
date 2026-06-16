import type { Metadata } from "next";
import { BookingPageContent } from "@/app/booking/booking-page-content";
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
        <BookingPageContent homeServiceWaHref={homeServiceWaHref} />
      </div>
    </main>
  );
}
