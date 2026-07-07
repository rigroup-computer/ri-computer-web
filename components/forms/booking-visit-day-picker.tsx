"use client";

import { useMemo } from "react";
import { DayPicker, type Matcher } from "react-day-picker";
import { id as localeId } from "react-day-picker/locale";
import {
  dateToIsoDate,
  formatIsoDateToday,
  getBookingCalendarEndMonth,
  isoDateToDate,
  isStoreOpenOnDate,
} from "@/lib/store-hours";
import "./booking-date.style.css";

const NAV_BUTTON_CLASS =
  "absolute top-4 inline-flex size-9 items-center justify-center rounded-sm border border-slate-300 text-slate-600 hover:bg-slate-50 aria-disabled:cursor-not-allowed aria-disabled:border-slate-200 aria-disabled:text-slate-300 aria-disabled:opacity-50 aria-disabled:hover:bg-transparent";

export type BookingVisitDayPickerProps = Readonly<{
  selectedIsoDate: string;
  onSelectIsoDate: (isoDate: string) => void;
  className?: string;
}>;

export function BookingVisitDayPicker({
  selectedIsoDate,
  onSelectIsoDate,
  className = "",
}: BookingVisitDayPickerProps) {
  const todayIso = formatIsoDateToday();
  const todayDate = useMemo(() => isoDateToDate(todayIso), [todayIso]);
  const selectedDate = useMemo(
    () => (selectedIsoDate ? isoDateToDate(selectedIsoDate) : undefined),
    [selectedIsoDate],
  );
  const endMonth = useMemo(() => getBookingCalendarEndMonth(), []);

  const disabled = useMemo<Matcher[]>(() => {
    if (!todayDate) {
      return [(date: Date) => !isStoreOpenOnDate(date)];
    }
    return [{ before: todayDate }, (date: Date) => !isStoreOpenOnDate(date)];
  }, [todayDate]);

  return (
    <DayPicker
      mode="single"
      locale={localeId}
      weekStartsOn={1}
      showOutsideDays
      fixedWeeks
      selected={selectedDate}
      onSelect={(date) => {
        if (!date) {
          return;
        }
        onSelectIsoDate(dateToIsoDate(date));
      }}
      disabled={disabled}
      startMonth={todayDate}
      endMonth={endMonth}
      defaultMonth={selectedDate ?? todayDate}
      className={`booking-day-picker ${className}`.trim()}
      classNames={{
        root: "w-full",
        months: "flex w-full max-w-none flex-col",
        month: "space-y-3 min-h-[300px]",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-mate-black",
        nav: "flex items-center gap-1",
        button_previous: `${NAV_BUTTON_CLASS} left-4`,
        button_next: `${NAV_BUTTON_CLASS} right-4`,
        weekdays: "flex",
        weekday:
          "w-9 text-[11px] font-semibold uppercase tracking-wide text-slate-500",
        week: "mt-1 flex w-full",
        day: "p-0 text-center text-sm w-full",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-sm text-sm font-medium text-slate-800 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        selected:
          "[&>button]:bg-primary [&>button]:text-white [&>button]:hover:bg-primary [&>button]:hover:text-white",
        today: "[&>button]:font-bold [&>button]:text-primary",
        disabled: "[&>button]:text-slate-300 [&>button]:hover:bg-transparent",
        outside: "[&>button]:text-slate-300",
      }}
    />
  );
}
