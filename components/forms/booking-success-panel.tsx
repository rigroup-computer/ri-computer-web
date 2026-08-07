"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import type { CreateServiceOrderSuccess } from "@/src/lib/actions/service-order";
import { whatsappHref } from "@/lib/whatsapp";
import { bookingPaymentConfirmationMessage } from "@/components/forms/booking-form-shared";
import { formatVisitDateTimeId, visitScheduleStatusLabel } from "@/lib/store-hours";

type BookingSuccessPanelProps = Readonly<{
  success: CreateServiceOrderSuccess;
}>;

const noRekening = "8090638379";
const qrisPaymentImageSrc = "/images/assets/qris-payment.jpeg";

const waCtaClassName =
  "inline-flex h-11 w-full touch-manipulation items-center justify-center gap-1 rounded-sm bg-[#1fb957] px-2 text-sm font-medium text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8]/40";

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width={14} height={14} x={8} y={8} rx={2} ry={2} />
      <path d="M4 16V6a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={32}
      height={32}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#1A73E8FF]"
      aria-hidden
    >
      <path d="M3 10h18" />
      <path d="M5 10V19" />
      <path d="M9 10V19" />
      <path d="M15 10V19" />
      <path d="M19 10V19" />
      <path d="M3 19h18" />
      <path d="M12 3 2 10h20L12 3z" />
    </svg>
  );
}

function QrCodeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#1A73E8FF]"
      aria-hidden
    >
      <rect x={3} y={3} width={7} height={7} />
      <rect x={14} y={3} width={7} height={7} />
      <rect x={3} y={14} width={7} height={7} />
      <path d="M14 14h.01" />
      <path d="M18 14h.01" />
      <path d="M14 18h.01" />
      <path d="M18 18h.01" />
      <path d="M21 14v4" />
      <path d="M14 21h4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function BookingSuccessPanel({ success }: BookingSuccessPanelProps) {
  const paymentWa = success.shopWhatsApp
    ? whatsappHref(
        success.shopWhatsApp,
        bookingPaymentConfirmationMessage(success.trackingId),
      )
    : null;

  return (
    <div className="space-y-4 rounded-2xl border border-[#DEE1E6FF] bg-[#FAFAFBFF] px-5 py-6 text-sm shadow-inner lg:mx-auto lg:max-w-md">
      <div className="mx-auto mt-2 size-fit rounded-full bg-[#1A73E8FF] p-1.5 text-white outline-8 outline-[#1A73E81A]">
        <CheckIcon />
      </div>
      <p className="text-center text-xl font-semibold text-blue-950">
        Booking berhasil
      </p>
      <div className="flex flex-col rounded-md border border-dashed border-[#DEE1E6FF] bg-white p-2">
        <p className="text-[10px] text-blue-950/80">Tracking ID Anda:</p>
        <div className="flex items-center gap-2">
          <span className="line-clamp-1 flex-1 text-base font-semibold">
            {success.trackingId}
          </span>
          <button
            type="button"
            aria-label="Salin nomor lacak"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(success.trackingId);
                toast.success("Tracking ID berhasil disalin");
              } catch {
                toast.error("Gagal menyalin.");
              }
            }}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-[#1A73E8FF]"
          >
            <CopyIcon />
          </button>
        </div>
      </div>
      <section
        aria-labelledby="payment-heading"
        className="flex flex-col rounded-md border border-[#1A73E833] bg-[#F0F7FF] p-3"
      >
        <h3
          id="payment-heading"
          className="text-sm font-semibold text-blue-950/80"
        >
          Informasi Pembayaran
        </h3>
        <p className="mt-1 text-xs text-blue-950/80">
          Wajib bayar booking <strong>Rp 10.000</strong> — pilih salah satu
          metode:
        </p>

        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5">
            <BankIcon />
            <span className="text-xs font-semibold text-blue-950/80">
              Transfer Bank
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-white p-2">
            <p className="font-semibold text-[#171A1FFF]">BCA {noRekening}</p>
            <button
              type="button"
              aria-label="Salin nomor rekening"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(noRekening);
                  toast.success("Nomor rekening berhasil disalin");
                } catch {
                  toast.error("Gagal menyalin.");
                }
              }}
              className="inline-flex size-10 shrink-0 items-center justify-end rounded-sm text-[#1A73E8FF]"
            >
              <CopyIcon />
            </button>
          </div>
          <p className="mt-1 text-xs text-[#565D6DFF]">
            an PT. Ri Group Raya Sejahtera
          </p>
        </div>

        <div className="relative my-4 flex items-center">
          <div className="flex-1 border-t border-[#DEE1E6FF]" aria-hidden />
          <span className="px-2 text-xs font-medium text-[#565D6DFF]">
            ATAU
          </span>
          <div className="flex-1 border-t border-[#DEE1E6FF]" aria-hidden />
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <QrCodeIcon />
            <span className="text-xs font-semibold text-blue-950/80">QRIS</span>
          </div>
          <div className="overflow-hidden rounded-md bg-white">
            <Image
              src={qrisPaymentImageSrc}
              alt="Kode QRIS untuk pembayaran booking Rp 10.000"
              width={320}
              height={400}
              className="h-auto w-full"
            />
            <a
              href={qrisPaymentImageSrc}
              download="qris-pembayaran-booking.jpeg"
              className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-1.5 border-t border-[#DEE1E6FF] text-xs font-medium text-[#1A73E8FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8]/40 focus-visible:ring-inset"
            >
              <DownloadIcon />
              Unduh QRIS
            </a>
          </div>
        </div>

        <p className="mb-2 mt-4 text-xs">
          Kirim bukti pembayaran ke WhatsApp admin dengan klik konfirmasi di
          bawah ini:
        </p>
        {paymentWa ? (
          <Link
            href={paymentWa}
            target="_blank"
            rel="noopener noreferrer"
            className={waCtaClassName}
          >
            <WhatsAppIcon />
            Konfirmasi Pembayaran
          </Link>
        ) : (
          <>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Nomor WhatsApp toko belum dikonfigurasi"
              className={`${waCtaClassName} opacity-70`}
            >
              <WhatsAppIcon />
              Konfirmasi Pembayaran
            </button>
            <p className="mt-2 text-xs text-[#565D6DFF]">
              Nomor WhatsApp toko belum dikonfigurasi
            </p>
          </>
        )}
      </section>
      {success.preferredVisitAt ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-950">
          <p className="font-semibold">Preferensi jadwal Anda</p>
          <p className="mt-1">
            {formatVisitDateTimeId(new Date(success.preferredVisitAt))} WIB
          </p>
          <p className="mt-2 text-amber-900/90">
            Status: {visitScheduleStatusLabel("REQUESTED")}. Admin Ri Computer
            akan memverifikasi jadwal ini sebelum kunjungan.
          </p>
        </div>
      ) : null}
      <p className="text-xs text-blue-950/75">
        Simpan Tracking ID Anda untuk memantau status perbaikan secara berkala.
      </p>
      <div className="flex flex-col gap-2">
        <Link
          href="/tracking"
          className="inline-flex h-11 items-center justify-center rounded-sm border border-blue-600 bg-white text-sm font-medium text-blue-700"
        >
          Lihat Status
        </Link>
      </div>
    </div>
  );
}
