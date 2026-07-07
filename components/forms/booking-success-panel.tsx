"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import type { CreateServiceOrderSuccess } from "@/src/lib/actions/service-order";
import { whatsappHref } from "@/lib/whatsapp";
import { bookingPaymentConfirmationMessage } from "@/components/forms/booking-form-shared";
import { formatVisitDateTimeId, visitScheduleStatusLabel } from "@/lib/store-hours";

type BookingSuccessPanelProps = Readonly<{
  success: CreateServiceOrderSuccess;
}>;

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
        <Icon
          icon="material-symbols:check"
          width={32}
          height={32}
          aria-hidden
        />
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
                toast.error("Gagal bisa menyalin.");
              }
            }}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-blue-950"
          >
            <Icon
              icon="solar:copy-line-duotone"
              className="text-[#1A73E8FF]"
              width={16}
              height={16}
              aria-hidden
            />
          </button>
        </div>
      </div>
      <div className="flex flex-col rounded-md border border-[#1A73E833] bg-[#E8F1FFFF] p-3">
        <h3 className="mb-2 text-sm font-semibold text-blue-950/80">
          Informasi Pembayaran
        </h3>
        <p className="text-xs">
          Wajib bayar booking <strong>Rp 10.000</strong> ke rekening berikut:
        </p>
        <div className="my-4 flex items-center justify-between rounded-md bg-[#FFFFFFFF] p-2">
          <div>
            <p className="font-semibold text-[#171A1FFF]">BCA 0084402466</p>
            <p className="text-xs text-[#565D6DFF]">an Ri Group Raya Sejahtera</p>
          </div>
          <button
            type="button"
            aria-label="Salin nomor rekening"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText("0084402466");
                toast.success("Nomor rekening berhasil disalin");
              } catch {
                toast.error("Gagal bisa menyalin.");
              }
            }}
            className="inline-flex size-10 shrink-0 items-center justify-end rounded-sm text-blue-950"
          >
            <Icon
              icon="solar:copy-line-duotone"
              className="text-[#1A73E8FF]"
              width={16}
              height={16}
              aria-hidden
            />
          </button>
        </div>
        <p className="mb-2 text-xs">
          Kirim bukti pembayaran ke whatsapp admin dengan klik konfirmasi di
          bawah ini:
        </p>
        {paymentWa ? (
          <Link
            href={paymentWa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-1 rounded-sm bg-[#1fb957] px-2 text-sm font-medium text-white shadow-sm"
          >
            <Icon
              icon="ic:baseline-whatsapp"
              width={24}
              height={24}
              className="text-white"
              aria-hidden
            />
            Konfirmasi Pembayaran
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title="Nomor WhatsApp toko belum dikonfigurasi"
            className="inline-flex h-11 items-center justify-center gap-1 rounded-sm bg-[#1fb957] px-2 text-sm font-medium text-white opacity-70 shadow-sm"
          >
            <Icon
              icon="ic:baseline-whatsapp"
              width={24}
              height={24}
              className="text-white"
              aria-hidden
            />
            Konfirmasi Pembayaran
          </button>
        )}
      </div>
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
