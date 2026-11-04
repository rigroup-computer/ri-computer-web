export const SCHEDULE_SERVICE_TYPES = ["REGULAR", "DELIVERY"] as const;
export type ScheduleServiceType = (typeof SCHEDULE_SERVICE_TYPES)[number];

/** Times are "HH:mm" (Asia/Jakarta). `slots` are bookable start times. */
export type DaySchedule = Readonly<{
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  slots: readonly string[];
  note?: string | null;
}>;

/** Index = weekday (0=Minggu..6=Sabtu); always 7 entries. */
export type WeeklySchedule = readonly DaySchedule[];

/** Serializable — safe to pass from Server to Client Components. */
export type ScheduleConfig = Readonly<{
  weekly: Readonly<Record<ScheduleServiceType, WeeklySchedule>>;
  /** Keyed by "YYYY-MM-DD". */
  overrides: Readonly<Record<ScheduleServiceType, Readonly<Record<string, DaySchedule>>>>;
}>;
