"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Icon } from "@iconify/react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  fieldBorderClass,
  inputBorderClass,
  inputClass,
  labelClass,
} from "@/components/forms/booking-form-shared";
import {
  formatVisitDateId,
  getAvailableTimeSlots,
  isStoreOpenOnIsoDate,
} from "@/lib/store-hours";

const BookingVisitDayPicker = dynamic(
  () =>
    import("@/components/forms/booking-visit-day-picker").then(
      (mod) => mod.BookingVisitDayPicker,
    ),
  { ssr: false },
);

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

export type BookingScheduleFieldsProps = Readonly<{
  preferredVisitDate: string;
  preferredVisitTime: string;
  onPreferredVisitDateChange: (isoDate: string) => void;
  onPreferredVisitTimeChange: (time: string) => void;
  fieldErrors: Record<string, string>;
  onClearFieldError: (name: string) => void;
}>;

export function BookingScheduleFields({
  preferredVisitDate,
  preferredVisitTime,
  onPreferredVisitDateChange,
  onPreferredVisitTimeChange,
  fieldErrors,
  onClearFieldError,
}: BookingScheduleFieldsProps) {
  const isDesktop = useIsDesktopCalendar();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const timeSlots = useMemo(
    () => (preferredVisitDate ? getAvailableTimeSlots(preferredVisitDate) : []),
    [preferredVisitDate],
  );

  const formattedDate = preferredVisitDate
    ? formatVisitDateId(preferredVisitDate)
    : null;

  const handleDateSelect = useCallback(
    (isoDate: string) => {
      onClearFieldError("preferredVisitDate");
      onClearFieldError("preferredVisitTime");
      if (!isoDate || !isStoreOpenOnIsoDate(isoDate)) {
        return;
      }
      onPreferredVisitDateChange(isoDate);
      onPreferredVisitTimeChange("");
      setCalendarOpen(false);
    },
    [
      onClearFieldError,
      onPreferredVisitDateChange,
      onPreferredVisitTimeChange,
    ],
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

  const dateTriggerClass = fieldBorderClass(
    !!fieldErrors.preferredVisitDate,
    `${inputClass} flex items-center justify-between text-left font-normal`,
    inputBorderClass,
  );

  return (
    <div className="space-y-5">
      <div ref={popoverRef} className="relative">
        <label htmlFor="preferredVisitDate" className={labelClass}>
          Pilih Tanggal*
        </label>
        <input
          type="hidden"
          id="preferredVisitDate"
          name="preferredVisitDate"
          value={preferredVisitDate}
          required
        />
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={calendarOpen}
          aria-invalid={!!fieldErrors.preferredVisitDate}
          aria-describedby={
            fieldErrors.preferredVisitDate ? "preferredVisitDate-error" : undefined
          }
          onClick={() => setCalendarOpen((open) => !open)}
          className={`mt-2 touch-manipulation ${dateTriggerClass}`}
        >
          <span className={formattedDate ? "text-slate-900" : "text-slate-400"}>
            {formattedDate ?? "Pilih tanggal kunjungan"}
          </span>
          <Icon
            icon="mdi:calendar-month-outline"
            width={20}
            height={20}
            className="shrink-0 text-slate-500"
            aria-hidden
          />
        </button>

        {calendarOpen && isDesktop ? (
          <div
            role="dialog"
            aria-label="Pilih tanggal kunjungan"
            className="absolute left-0 top-full z-50 mt-2 w-full min-w-[320px] max-w-[360px] rounded-sm border border-slate-300 bg-white p-3 shadow-lg"
          >
            <BookingVisitDayPicker
              selectedIsoDate={preferredVisitDate}
              onSelectIsoDate={handleDateSelect}
            />
            <p className="mt-2 text-[11px] text-slate-500">
              Hanya Senin–Kamis &amp; Sabtu (Jaya Plaza). Jumat &amp; Minggu tutup.
            </p>
          </div>
        ) : null}

        {fieldErrors.preferredVisitDate ? (
          <p id="preferredVisitDate-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.preferredVisitDate}
          </p>
        ) : null}
      </div>

      <BottomSheet
        open={calendarOpen && !isDesktop}
        onOpenChange={setCalendarOpen}
        title="Pilih Tanggal"
        sheetMaxHeightClass="max-h-[min(90dvh,100%)]"
        ariaLabel="Pilih tanggal kunjungan"
      >
        {calendarOpen && !isDesktop ? (
          <>
            <BookingVisitDayPicker
              selectedIsoDate={preferredVisitDate}
              onSelectIsoDate={handleDateSelect}
            />
            <p className="px-2 pb-2 text-[11px] text-slate-500">
              Hanya Senin–Kamis &amp; Sabtu (Jaya Plaza). Jumat &amp; Minggu tutup.
            </p>
          </>
        ) : null}
      </BottomSheet>

      <div>
        <span className={labelClass}>Pilih Jam*</span>
        <div
          role="radiogroup"
          aria-label="Pilih Jam"
          aria-invalid={!!fieldErrors.preferredVisitTime}
          className={`mt-2 grid grid-cols-4 gap-2 rounded-sm ${
            fieldErrors.preferredVisitTime ? "ring-2 ring-red-500/50" : ""
          }`}
        >
          {timeSlots.length === 0 ? (
            <p className="col-span-4 text-xs text-slate-500">
              {preferredVisitDate
                ? "Tidak ada slot tersedia untuk tanggal ini."
                : "Pilih tanggal terlebih dahulu."}
            </p>
          ) : (
            timeSlots.map((slot) => {
              const selected = preferredVisitTime === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!preferredVisitDate}
                  onClick={() => {
                    onClearFieldError("preferredVisitTime");
                    onPreferredVisitTimeChange(slot);
                  }}
                  className={`min-h-12 touch-manipulation rounded-sm border py-2 text-center text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? "border-primary bg-primary text-white"
                      : "border-slate-300 bg-white text-slate-600 active:bg-slate-50"
                  }`}
                >
                  {slot}
                </button>
              );
            })
          )}
        </div>
        <input type="hidden" name="preferredVisitTime" value={preferredVisitTime} />
        {fieldErrors.preferredVisitTime ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.preferredVisitTime}</p>
        ) : null}
      </div>
    </div>
  );
}
