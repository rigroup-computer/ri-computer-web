"use client";

import { Suspense, useState } from "react";
import { BookingForm } from "@/components/forms/booking-form";

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
      <Suspense
        fallback={
          <p className="mt-10 text-sm text-slate-500">Memuat formulir…</p>
        }
      >
        <BookingForm
          homeServiceWaHref={homeServiceWaHref}
          onSuccessChange={setBookingSucceeded}
        />
      </Suspense>
    </>
  );
}
