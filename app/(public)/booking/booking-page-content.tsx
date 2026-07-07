"use client";

import { Suspense, useState } from "react";
import { BookingForm } from "@/components/forms/booking-form";

function BookingFormFallback() {
  return <div className="h-[402px] lg:h-52 mt-10 bg-gray-50 rounded-lg" />;
}

export function BookingPageContent({
  homeServiceWaHref,
}: Readonly<{
  homeServiceWaHref: string | null;
}>) {
  const [bookingSucceeded, setBookingSucceeded] = useState(false);

  return (
    <>
      {!bookingSucceeded ? (
        <>
          <h1 className="text-xl font-bold text-slate-900">Booking Service</h1>
          <p className="mt-2 text-sm text-slate-600">
            Pilih layanan yang sesuai kebutuhan Anda.
          </p>
        </>
      ) : null}
      <Suspense fallback={<BookingFormFallback />}>
        <BookingForm
          homeServiceWaHref={homeServiceWaHref}
          onSuccessChange={setBookingSucceeded}
        />
      </Suspense>
    </>
  );
}
