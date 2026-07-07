"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Icon } from "@iconify/react";
import { BookingVisitDayPicker } from "@/components/forms/booking-visit-day-picker";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { formatVisitDateId, isStoreOpenOnIsoDate } from "@/lib/store-hours";
import "@/components/forms/booking-date.style.css";

function useIsDesktopCalendar(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia("(min-width: 1024px)");
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

type AdminVisitDateFieldProps = Readonly<{
  visitDate: string;
  disabled?: boolean;
  onDateChange: (isoDate: string) => void;
}>;

export function AdminVisitDateField({
  visitDate,
  disabled = false,
  onDateChange,
}: AdminVisitDateFieldProps) {
  const isDesktop = useIsDesktopCalendar();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const formattedDate = visitDate ? formatVisitDateId(visitDate) : null;

  const handleDateSelect = useCallback(
    (isoDate: string) => {
      if (!isoDate || !isStoreOpenOnIsoDate(isoDate)) {
        return;
      }
      onDateChange(isoDate);
      setCalendarOpen(false);
    },
    [onDateChange],
  );

  useEffect(() => {
    if (!calendarOpen || !isDesktop) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [calendarOpen, isDesktop]);

  return (
    <>
      <div ref={popoverRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={calendarOpen}
          onClick={() => setCalendarOpen((open) => !open)}
          className="mt-2 flex min-h-11 w-full touch-manipulation items-center justify-between rounded-lg border border-[#dee1e6] bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={formattedDate ? "text-[#171a1f]" : "text-[#565d6d]"}>
            {formattedDate ?? "Pilih tanggal konfirmasi"}
          </span>
          <Icon
            icon="mdi:calendar-month-outline"
            width={20}
            height={20}
            className="shrink-0 text-[#565d6d]"
            aria-hidden
          />
        </button>

        {calendarOpen && isDesktop ? (
          <div
            role="dialog"
            aria-label="Pilih tanggal konfirmasi"
            className="absolute left-0 top-full z-50 mt-2 w-full min-w-[320px] max-w-[360px] rounded-lg border border-[#dee1e6] bg-white p-3 shadow-lg"
          >
            <BookingVisitDayPicker
              selectedIsoDate={visitDate}
              onSelectIsoDate={handleDateSelect}
            />
            <p className="mt-2 text-[11px] text-[#565d6d]">
              Hanya Senin–Kamis &amp; Sabtu (Jaya Plaza). Jumat &amp; Minggu tutup.
            </p>
          </div>
        ) : null}
      </div>

      <BottomSheet
        open={calendarOpen && !isDesktop}
        onOpenChange={setCalendarOpen}
        title="Pilih Tanggal"
        sheetMaxHeightClass="max-h-[min(90dvh,100%)]"
        ariaLabel="Pilih tanggal konfirmasi"
      >
        {calendarOpen && !isDesktop ? (
          <>
            <BookingVisitDayPicker
              selectedIsoDate={visitDate}
              onSelectIsoDate={handleDateSelect}
            />
            <p className="px-2 pb-2 text-[11px] text-[#565d6d]">
              Hanya Senin–Kamis &amp; Sabtu (Jaya Plaza). Jumat &amp; Minggu tutup.
            </p>
          </>
        ) : null}
      </BottomSheet>
    </>
  );
}
