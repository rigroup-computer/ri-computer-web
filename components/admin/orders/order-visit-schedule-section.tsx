"use client";

import { useMemo, useState } from "react";
import { VisitScheduleStatus } from "@prisma/client";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { confirmServiceVisitSchedule } from "@/src/lib/actions/admin-orders";
import {
  formatVisitDateTimeId,
  getAdminTimeSlotsForDate,
  isStoreOpenOnIsoDate,
  visitScheduleStatusLabel,
} from "@/lib/store-hours";
import { serviceTypeAdminLabel } from "@/lib/admin-order-status-display";
import { whatsappHref } from "@/lib/whatsapp";
import { AdminVisitDateField } from "@/components/admin/orders/admin-visit-date-field";
import type { AdminSerializedOrder } from "./order-row-data";

type OrderVisitScheduleSectionProps = Readonly<{
  order: AdminSerializedOrder;
  onAfterAction: () => void;
}>;

function isoDateFromPreferred(preferredVisitAt: string | null): string {
  if (!preferredVisitAt) {
    return "";
  }
  const date = new Date(preferredVisitAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

function timeFromPreferred(preferredVisitAt: string | null): string {
  if (!preferredVisitAt) {
    return "";
  }
  const date = new Date(preferredVisitAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(date);
}

function activeScheduleAt(order: AdminSerializedOrder): string | null {
  if (order.visitScheduleStatus === VisitScheduleStatus.DECLINED) {
    return order.preferredVisitAt;
  }
  if (
    order.confirmedVisitAt &&
    order.visitScheduleStatus !== VisitScheduleStatus.REQUESTED
  ) {
    return order.confirmedVisitAt;
  }
  return order.preferredVisitAt ?? order.confirmedVisitAt;
}

function visitScheduleStatusChipClassName(
  status: VisitScheduleStatus,
): string {
  const base = "rounded-full px-2.5 py-1 text-xs font-semibold";

  switch (status) {
    case VisitScheduleStatus.REQUESTED:
      return `${base} bg-[#eff6ff] text-[#1a73e8]`;
    case VisitScheduleStatus.CONFIRMED:
      return `${base} border border-emerald-200 bg-emerald-50 text-emerald-800`;
    case VisitScheduleStatus.RESCHEDULED:
      return `${base} border border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]`;
    case VisitScheduleStatus.DECLINED:
      return `${base} border border-amber-300 bg-amber-50 text-amber-900`;
  }
}

export function OrderVisitScheduleSection({
  order,
  onAfterAction,
}: OrderVisitScheduleSectionProps) {
  const scheduleAt = activeScheduleAt(order);
  const initialDate = isoDateFromPreferred(scheduleAt);
  const initialTime = timeFromPreferred(scheduleAt);

  const [visitDate, setVisitDate] = useState(initialDate);
  const [visitTime, setVisitTime] = useState(initialTime);
  const [note, setNote] = useState(order.visitScheduleNote ?? "");
  const [pending, setPending] = useState(false);

  const timeSlots = useMemo(
    () => (visitDate ? getAdminTimeSlotsForDate(visitDate) : []),
    [visitDate],
  );

  const scheduleResolved =
    order.visitScheduleStatus === VisitScheduleStatus.CONFIRMED;
  const isDeclined =
    order.visitScheduleStatus === VisitScheduleStatus.DECLINED;
  const isRescheduled =
    order.visitScheduleStatus === VisitScheduleStatus.RESCHEDULED;

  async function submitAction(
    action: "confirm" | "reschedule" | "decline",
  ): Promise<void> {
    if (action !== "decline" && (!visitDate || !visitTime)) {
      toast.error("Pilih tanggal dan jam terlebih dahulu.");
      return;
    }

    if (action !== "decline" && !isStoreOpenOnIsoDate(visitDate)) {
      toast.error("Toko tutup pada hari tersebut.");
      return;
    }

    setPending(true);
    try {
      const fd = new FormData();
      fd.set("orderId", order.id);
      fd.set("action", action);
      if (action !== "decline") {
        fd.set("confirmedVisitDate", visitDate);
        fd.set("confirmedVisitTime", visitTime);
      }
      if (note.trim()) {
        fd.set("note", note.trim());
      }

      const result = await confirmServiceVisitSchedule(fd);
      toast.success(
        action === "confirm"
          ? "Jadwal dikonfirmasi."
          : action === "reschedule"
            ? "Jadwal alternatif disimpan."
            : "Preferensi ditolak. Ajukan jadwal alternatif.",
      );
      onAfterAction();

      if (result.whatsAppMessage) {
        const href = whatsappHref(order.customerPhone, result.whatsAppMessage);
        if (href) {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          toast.error("Nomor WhatsApp pelanggan tidak valid.");
        }
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal memperbarui jadwal.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="px-4 lg:px-5 mb-2 lg:mb-2 bg-white py-4">
      <div className="flex items-center gap-2">
        <Icon
          icon="mdi:calendar-clock"
          width={26}
          height={26}
          aria-hidden
          className="text-[#1A73E8FF]"
        />
        <p className="font-semibold text-base text-[#171a1f] uppercase">
          Konfirmasi Jadwal
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-[#dee1e6] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={visitScheduleStatusChipClassName(order.visitScheduleStatus)}
          >
            {visitScheduleStatusLabel(order.visitScheduleStatus)}
          </span>
        </div>

        {isDeclined ? (
          <p className="mt-2 text-xs text-amber-900">
            Jadwal yang dipilih pelanggan belum bisa dipakai. Pilih tanggal alternatif di
            bawah.
          </p>
        ) : null}

        {isRescheduled ? (
          <p className="mt-2 text-xs text-[#1d4ed8]">
            Menunggu konfirmasi pelanggan. Konfirmasi jadwal setelah pelanggan
            setuju via WhatsApp.
          </p>
        ) : null}

        {order.preferredVisitAt ? (
          <p className="mt-3 text-sm text-[#171a1f]">
            <span className="font-semibold">Jadwal yg dipilih pelanggan:</span><br />{" "}
            {formatVisitDateTimeId(new Date(order.preferredVisitAt))} WIB
          </p>
        ) : (
          <p className="mt-3 text-sm text-[#565d6d]">
            Pelanggan belum mengisi preferensi jadwal.
          </p>
        )}

        {order.confirmedVisitAt &&
        order.visitScheduleStatus !== VisitScheduleStatus.REQUESTED ? (
          <p className="mt-2 text-sm text-[#171a1f]">
            <span className="font-semibold">Jadwal admin:</span>{" "}
            {formatVisitDateTimeId(new Date(order.confirmedVisitAt))} WIB
          </p>
        ) : null}

        {!scheduleResolved ? (
          <>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#565d6d]">
                  Tanggal konfirmasi
                </p>
                <AdminVisitDateField
                  visitDate={visitDate}
                  disabled={pending}
                  onDateChange={(isoDate) => {
                    setVisitDate(isoDate);
                    setVisitTime("");
                  }}
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#565d6d]">Jam</p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {timeSlots.length === 0 ? (
                    <p className="col-span-4 text-xs text-[#565d6d]">
                      Pilih tanggal buka toko terlebih dahulu.
                    </p>
                  ) : (
                    timeSlots.map((slot) => {
                      const selected = visitTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={pending}
                          onClick={() => setVisitTime(slot)}
                          className={`min-h-10 rounded-lg border py-2 text-sm font-semibold ${
                            selected
                              ? "border-[#565d6d] bg-[#565d6d] text-white"
                              : "border-[#dee1e6] bg-white text-[#565d6d]"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor={`visit-note-${order.id}`}
                  className="text-xs font-semibold text-[#565d6d]"
                >
                  Catatan (opsional)
                </label>
                <textarea
                  id={`visit-note-${order.id}`}
                  rows={2}
                  value={note}
                  disabled={pending}
                  onChange={(event) => setNote(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#dee1e6] px-3 py-2 text-sm"
                  placeholder="Pesan untuk pelanggan via WhatsApp"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                disabled={pending}
                onClick={() => void submitAction("confirm")}
                className="min-h-11 flex-1 rounded-lg bg-[#1a73e8] px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                Konfirmasi jadwal
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => void submitAction("reschedule")}
                className="min-h-11 flex-1 rounded-lg border border-[#1a73e8] bg-white px-4 text-sm font-semibold text-[#1a73e8] disabled:opacity-60"
              >
                Ajukan jadwal lain
              </button>
              {!isDeclined ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void submitAction("decline")}
                  className="min-h-11 flex-1 rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 disabled:opacity-60"
                >
                  Tolak jadwal
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
