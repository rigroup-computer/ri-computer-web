import type { Metadata } from "next";
import { BookingPageContent } from "@/app/(public)/booking/booking-page-content";
import { ScheduleConfigProvider } from "@/components/schedule/schedule-config-provider";
import { homeServiceWhatsAppHref } from "@/lib/booking-service-links";
import { scheduleSdk } from "@/src/lib/sdk/schedule";

export const metadata: Metadata = {
  title: "Booking Servis Laptop",
  description:
    "Formulir Home Servis yang selaras guideline antarmuka aplikasi Ri Computer.",
};

export const revalidate = 3600;

export default async function BookingPage() {
  const homeServiceWaHref = homeServiceWhatsAppHref();
  const scheduleConfig = await scheduleSdk.getConfig();

  return (
    <main className="bg-white px-4 pb-24 pt-4">
      <div className="max-w-7xl mx-auto">
        <ScheduleConfigProvider config={scheduleConfig}>
          <BookingPageContent homeServiceWaHref={homeServiceWaHref} />
        </ScheduleConfigProvider>
      </div>
    </main>
  );
}
