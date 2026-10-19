/** Jaya Plaza booking schedule — resolves admin-managed weekly rules + date exceptions. */
import type {
  DaySchedule,
  ScheduleConfig,
  ScheduleServiceType,
} from "@/lib/types/schedule";

export const STORE_TIMEZONE = "Asia/Jakarta";

export type StoreHoursRow = Readonly<{
  label: string;
  hours: string;
  closed: boolean;
}>;

export const WEEKDAY_LABELS_ID = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

/** Monday-first display order (JS weekday numbers). */
export const WEEKDAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

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

export function isIsoDate(value: string): boolean {
  return parseIsoDateOnly(value) !== null;
}

/** "HH:mm" → minutes since midnight, or null when malformed. */
export function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) {
    return null;
  }
  const hour = Number.parseInt(match[1]!, 10);
  const minute = Number.parseInt(match[2]!, 10);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return hour * 60 + minute;
}

export function formatMinutesAsTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Normalize, dedupe, and sort "HH:mm" slots; drops malformed entries. */
export function normalizeSlots(slots: readonly string[]): string[] {
  const minutes = new Set<number>();
  for (const slot of slots) {
    const value = parseTimeToMinutes(slot);
    if (value !== null) {
      minutes.add(value);
    }
  }
  return [...minutes].sort((a, b) => a - b).map(formatMinutesAsTime);
}

/** Hourly slot starts from the first full hour at/after open; each slot must end by close. */
export function generateHourlySlots(openTime: string, closeTime: string): string[] {
  const open = parseTimeToMinutes(openTime);
  const close = parseTimeToMinutes(closeTime);
  if (open === null || close === null || close <= open) {
    return [];
  }
  const slots: string[] = [];
  for (let start = Math.ceil(open / 60) * 60; start + 60 <= close; start += 60) {
    slots.push(formatMinutesAsTime(start));
  }
  return slots;
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

/** Calendar-cell Date (local midnight from the day picker) → YYYY-MM-DD. */
function calendarDateToIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Latest bookable month (exclusive) — limits calendar navigation. */
export function getBookingCalendarEndMonth(from: Date = new Date()): Date {
  const todayIso = formatIsoDateToday(from);
  const parsed = parseIsoDateOnly(todayIso);
  if (!parsed) {
    return new Date(from.getFullYear(), from.getMonth() + 2, 1);
  }
  return new Date(parsed.year, parsed.month - 1 + 2, 1);
}

/** Last ISO date shown in the booking calendar (end of next month). */
export function getBookingCalendarLastIsoDate(from: Date = new Date()): string {
  const end = getBookingCalendarEndMonth(from);
  const last = new Date(end.getFullYear(), end.getMonth(), 0);
  return calendarDateToIsoDate(last);
}

/** Service types that may affect visit slot hours. HOME_SERVICE follows REGULAR. */
export type VisitSlotServiceType = "REGULAR" | "DELIVERY" | "HOME_SERVICE";

export function toScheduleServiceType(
  serviceType?: VisitSlotServiceType,
): ScheduleServiceType {
  return serviceType === "DELIVERY" ? "DELIVERY" : "REGULAR";
}

/** Date exception if present, otherwise the weekly rule. Null for malformed dates. */
export function resolveDaySchedule(
  config: ScheduleConfig,
  isoDate: string,
  serviceType?: VisitSlotServiceType,
): DaySchedule | null {
  const weekday = getWeekdayForIsoDate(isoDate);
  if (weekday === null) {
    return null;
  }
  const type = toScheduleServiceType(serviceType);
  return config.overrides[type][isoDate] ?? config.weekly[type][weekday] ?? null;
}

function bookableSlotsForDate(
  config: ScheduleConfig,
  isoDate: string,
  serviceType?: VisitSlotServiceType,
): string[] {
  const day = resolveDaySchedule(config, isoDate, serviceType);
  if (!day || !day.isOpen) {
    return [];
  }
  return normalizeSlots(day.slots);
}

export function isStoreOpenOnIsoDate(
  config: ScheduleConfig,
  isoDate: string,
  serviceType?: VisitSlotServiceType,
): boolean {
  return bookableSlotsForDate(config, isoDate, serviceType).length > 0;
}

export function isStoreOpenOnDate(
  config: ScheduleConfig,
  date: Date,
  serviceType?: VisitSlotServiceType,
): boolean {
  return isStoreOpenOnIsoDate(config, calendarDateToIsoDate(date), serviceType);
}

/**
 * Visit slots for a calendar day.
 * Today: only slots strictly after `now` (Jakarta).
 */
export function getAvailableTimeSlots(
  config: ScheduleConfig,
  isoDate: string,
  now: Date = new Date(),
  serviceType?: VisitSlotServiceType,
): string[] {
  const allSlots = bookableSlotsForDate(config, isoDate, serviceType);
  if (isoDate !== formatIsoDateToday(now)) {
    return allSlots;
  }

  const { hour, minute } = getJakartaParts(now);
  const nowMinutes = hour * 60 + minute;

  return allSlots.filter((slot) => {
    const slotMinutes = parseTimeToMinutes(slot);
    return slotMinutes !== null && slotMinutes > nowMinutes;
  });
}

export function isValidVisitTimeSlot(
  config: ScheduleConfig,
  isoDate: string,
  time: string,
  now: Date = new Date(),
  serviceType?: VisitSlotServiceType,
): boolean {
  const minutes = parseTimeToMinutes(time);
  if (minutes === null) {
    return false;
  }
  return getAvailableTimeSlots(config, isoDate, now, serviceType).includes(
    formatMinutesAsTime(minutes),
  );
}

/** Build UTC `Date` for a Jakarta-local datetime (WIB = UTC+7, no DST). */
function jakartaLocalToUtc(isoDate: string, minutes: number): Date | null {
  const parsedDate = parseIsoDateOnly(isoDate);
  if (!parsedDate) {
    return null;
  }
  return new Date(
    Date.UTC(parsedDate.year, parsedDate.month - 1, parsedDate.day, 0, minutes - 7 * 60, 0),
  );
}

export function combineVisitDateTime(
  config: ScheduleConfig,
  isoDate: string,
  timeHHmm: string,
  serviceType?: VisitSlotServiceType,
): Date | null {
  const minutes = parseTimeToMinutes(timeHHmm);
  if (minutes === null) {
    return null;
  }
  if (!isValidVisitTimeSlot(config, isoDate, timeHHmm, new Date(), serviceType)) {
    return null;
  }
  return jakartaLocalToUtc(isoDate, minutes);
}

/** Admin confirmation — validates open day and slot list, not the "today" cutoff. */
export function combineAdminVisitDateTime(
  config: ScheduleConfig,
  isoDate: string,
  timeHHmm: string,
  serviceType?: VisitSlotServiceType,
): Date | null {
  const minutes = parseTimeToMinutes(timeHHmm);
  if (minutes === null) {
    return null;
  }
  const allowed = bookableSlotsForDate(config, isoDate, serviceType);
  if (!allowed.includes(formatMinutesAsTime(minutes))) {
    return null;
  }
  return jakartaLocalToUtc(isoDate, minutes);
}

export function getAdminTimeSlotsForDate(
  config: ScheduleConfig,
  isoDate: string,
  serviceType?: VisitSlotServiceType,
): string[] {
  return bookableSlotsForDate(config, isoDate, serviceType);
}

function formatHoursLabel(day: DaySchedule): string {
  return `${day.openTime.replace(":", ".")} - ${day.closeTime.replace(":", ".")} WIB`;
}

function joinDayNames(names: readonly string[]): string {
  if (names.length <= 1) {
    return names[0] ?? "";
  }
  return `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
}

/**
 * Weekly opening hours for display, Monday-first. Consecutive days with equal hours
 * are grouped ("Senin - Kamis"); all closed days share one "TUTUP" row at the end.
 */
export function buildHoursDisplayRows(
  config: ScheduleConfig,
  serviceType: ScheduleServiceType = "REGULAR",
): StoreHoursRow[] {
  const weekly = config.weekly[serviceType];
  const rows: StoreHoursRow[] = [];
  const closedNames: string[] = [];
  let group: { weekdays: number[]; hours: string } | null = null;

  const flush = () => {
    if (!group) {
      return;
    }
    const names = group.weekdays.map((weekday) => WEEKDAY_LABELS_ID[weekday]);
    const label =
      names.length > 2 ? `${names[0]} - ${names.at(-1)}` : joinDayNames(names);
    rows.push({ label, hours: group.hours, closed: false });
    group = null;
  };

  for (const weekday of WEEKDAY_DISPLAY_ORDER) {
    const day = weekly[weekday];
    if (!day || !day.isOpen || day.slots.length === 0) {
      flush();
      closedNames.push(WEEKDAY_LABELS_ID[weekday]);
      continue;
    }
    const hours = formatHoursLabel(day);
    if (group && group.hours === hours) {
      group.weekdays.push(weekday);
    } else {
      flush();
      group = { weekdays: [weekday], hours };
    }
  }
  flush();

  if (closedNames.length > 0) {
    rows.push({ label: joinDayNames(closedNames), hours: "TUTUP", closed: true });
  }
  return rows;
}

/** Short calendar hint, e.g. "Buka Senin - Kamis, Sabtu. Jumat & Minggu tutup." */
export function describeWeeklyOpenDays(
  config: ScheduleConfig,
  serviceType: ScheduleServiceType = "REGULAR",
): string {
  const rows = buildHoursDisplayRows(config, serviceType);
  const open = rows.filter((row) => !row.closed).map((row) => row.label);
  const closed = rows.find((row) => row.closed)?.label;
  const openText = open.length > 0 ? `Buka ${open.join(", ")}.` : "Belum ada hari buka.";
  return closed ? `${openText} ${closed} tutup.` : openText;
}

export function formatVisitDateId(isoDate: string): string | null {
  const parsed = parseIsoDateOnly(isoDate);
  if (!parsed) {
    return null;
  }
  const probe = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, 5, 0, 0));
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: STORE_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(probe);
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
