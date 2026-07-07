/** Jaya Plaza store schedule — single source of truth for booking validation. */

export const STORE_TIMEZONE = "Asia/Jakarta";

export type StoreHoursRow = Readonly<{
  label: string;
  hours: string;
  closed: boolean;
}>;

/** Display rows for beranda / info cards (Jaya Plaza). */
export const JAYA_PLAZA_HOURS_DISPLAY: readonly StoreHoursRow[] = [
  { label: "Senin - Kamis", hours: "09.30 - 16.00 WIB", closed: false },
  { label: "Sabtu", hours: "09.30 - 16.30 WIB", closed: false },
  { label: "Jumat & Minggu", hours: "TUTUP", closed: true },
];

const OPEN_WEEKDAYS = new Set([1, 2, 3, 4, 6]); // Mon–Thu, Sat (JS: Sun=0)

type JakartaDateParts = Readonly<{
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
}>;

function getJakartaParts(date: Date): JakartaDateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value ?? "0";
    return Number.parseInt(value, 10);
  };

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const weekdayLabel = parts.find((part) => part.type === "weekday")?.value ?? "Sun";

  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    weekday: weekdayMap[weekdayLabel] ?? 0,
    hour: pick("hour") % 24,
    minute: pick("minute"),
  };
}

function parseIsoDateOnly(isoDate: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    return null;
  }
  const year = Number.parseInt(match[1]!, 10);
  const month = Number.parseInt(match[2]!, 10);
  const day = Number.parseInt(match[3]!, 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { year, month, day };
}

/** Weekday + calendar validity for an ISO date string (YYYY-MM-DD) in Jakarta. */
export function getWeekdayForIsoDate(isoDate: string): number | null {
  const parsed = parseIsoDateOnly(isoDate);
  if (!parsed) {
    return null;
  }
  const utcProbe = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0));
  return getJakartaParts(utcProbe).weekday;
}

export function isStoreOpenOnDate(date: Date): boolean {
  return OPEN_WEEKDAYS.has(getJakartaParts(date).weekday);
}

export function isStoreOpenOnIsoDate(isoDate: string): boolean {
  const weekday = getWeekdayForIsoDate(isoDate);
  return weekday !== null && OPEN_WEEKDAYS.has(weekday);
}

export function formatIsoDateToday(now: Date = new Date()): string {
  const { year, month, day } = getJakartaParts(now);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Parse YYYY-MM-DD to a local Date for calendar UI (no time component). */
export function isoDateToDate(isoDate: string): Date | undefined {
  const parsed = parseIsoDateOnly(isoDate);
  if (!parsed) {
    return undefined;
  }
  return new Date(parsed.year, parsed.month - 1, parsed.day);
}

/** Format a calendar Date as YYYY-MM-DD in Jakarta timezone. */
export function dateToIsoDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Latest bookable month (inclusive) — limits calendar navigation. */
export function getBookingCalendarEndMonth(from: Date = new Date()): Date {
  const todayIso = formatIsoDateToday(from);
  const parsed = parseIsoDateOnly(todayIso);
  if (!parsed) {
    return new Date(from.getFullYear(), from.getMonth() + 2, 1);
  }
  return new Date(parsed.year, parsed.month - 1 + 2, 1);
}

export function getOpenDaysInRange(from: Date, to: Date): Date[] {
  const results: Date[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    if (isStoreOpenOnDate(cursor)) {
      results.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
}

function slotHoursForWeekday(weekday: number): readonly number[] {
  if (weekday === 6) {
    return [10, 11, 12, 13, 14, 15, 16];
  }
  if (weekday >= 1 && weekday <= 4) {
    return [10, 11, 12, 13, 14, 15];
  }
  return [];
}

function formatSlotHour(hour: number): string {
  return `${hour}:00`;
}

function parseTimeSlot(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) {
    return null;
  }
  const hour = Number.parseInt(match[1]!, 10);
  const minute = Number.parseInt(match[2]!, 10);
  if (hour < 0 || hour > 23 || minute !== 0) {
    return null;
  }
  return hour;
}

/**
 * Hourly visit slots for a calendar day (Jaya Plaza).
 * Today: only slots strictly after `now` (Jakarta) and before close.
 */
export function getAvailableTimeSlots(
  isoDate: string,
  now: Date = new Date(),
): string[] {
  const weekday = getWeekdayForIsoDate(isoDate);
  if (weekday === null || !OPEN_WEEKDAYS.has(weekday)) {
    return [];
  }

  const allSlots = slotHoursForWeekday(weekday).map(formatSlotHour);
  const todayIso = formatIsoDateToday(now);

  if (isoDate !== todayIso) {
    return [...allSlots];
  }

  const { hour, minute } = getJakartaParts(now);
  const nowMinutes = hour * 60 + minute;

  return allSlots.filter((slot) => {
    const slotHour = parseTimeSlot(slot);
    if (slotHour === null) {
      return false;
    }
    return slotHour * 60 > nowMinutes;
  });
}

export function isValidVisitTimeSlot(isoDate: string, time: string, now: Date = new Date()): boolean {
  const slots = getAvailableTimeSlots(isoDate, now);
  return slots.includes(time);
}

/** Build UTC `Date` for a Jakarta-local visit datetime (WIB = UTC+7, no DST). */
export function combineVisitDateTime(isoDate: string, timeHHmm: string): Date | null {
  const parsedDate = parseIsoDateOnly(isoDate);
  const hour = parseTimeSlot(timeHHmm);
  if (!parsedDate || hour === null || !isStoreOpenOnIsoDate(isoDate)) {
    return null;
  }

  if (!isValidVisitTimeSlot(isoDate, timeHHmm)) {
    return null;
  }

  return new Date(
    Date.UTC(parsedDate.year, parsedDate.month - 1, parsedDate.day, hour - 7, 0, 0),
  );
}

/** Admin confirmation — validates open day and hourly slot range, not "today" cutoff. */
export function combineAdminVisitDateTime(isoDate: string, timeHHmm: string): Date | null {
  const parsedDate = parseIsoDateOnly(isoDate);
  const hour = parseTimeSlot(timeHHmm);
  if (!parsedDate || hour === null || !isStoreOpenOnIsoDate(isoDate)) {
    return null;
  }

  const weekday = getWeekdayForIsoDate(isoDate);
  if (weekday === null) {
    return null;
  }

  const allowedHours = slotHoursForWeekday(weekday);
  if (!allowedHours.includes(hour)) {
    return null;
  }

  return new Date(
    Date.UTC(parsedDate.year, parsedDate.month - 1, parsedDate.day, hour - 7, 0, 0),
  );
}

export function getAdminTimeSlotsForDate(isoDate: string): string[] {
  const weekday = getWeekdayForIsoDate(isoDate);
  if (weekday === null || !OPEN_WEEKDAYS.has(weekday)) {
    return [];
  }
  return slotHoursForWeekday(weekday).map(formatSlotHour);
}

export function formatVisitDateId(isoDate: string): string | null {
  const visitDate = combineVisitDateTime(isoDate, "10:00");
  if (!visitDate) {
    const parsed = parseIsoDateOnly(isoDate);
    if (!parsed) {
      return null;
    }
    const probe = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0));
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: STORE_TIMEZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(probe);
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: STORE_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(visitDate);
}

export function formatVisitDateTimeId(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: STORE_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function visitScheduleStatusLabel(
  status: "REQUESTED" | "CONFIRMED" | "RESCHEDULED" | "DECLINED",
): string {
  switch (status) {
    case "REQUESTED":
      return "Menunggu konfirmasi";
    case "CONFIRMED":
      return "Jadwal dikonfirmasi";
    case "RESCHEDULED":
      return "Jadwal diubah admin";
    case "DECLINED":
      return "Perlu diatur ulang";
  }
}
