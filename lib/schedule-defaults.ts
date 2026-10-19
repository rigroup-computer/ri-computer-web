import type { DaySchedule, ScheduleConfig, WeeklySchedule } from "@/lib/types/schedule";

/**
 * Jaya Plaza schedule before it became admin-managed. Used as fallback when the
 * schedule tables are empty; keep in sync with the seed in
 * prisma/migrations/20261019120000_add_booking_schedule.
 */
const WEEKDAY_SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"] as const;
const SATURDAY_SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00"] as const;

const CLOSED: DaySchedule = { isOpen: false, openTime: "09:30", closeTime: "16:00", slots: [] };
const WEEKDAY: DaySchedule = { isOpen: true, openTime: "09:30", closeTime: "16:00", slots: WEEKDAY_SLOTS };
const SATURDAY: DaySchedule = { isOpen: true, openTime: "09:30", closeTime: "16:30", slots: SATURDAY_SLOTS };
const DELIVERY_MORNING: DaySchedule = { isOpen: true, openTime: "09:30", closeTime: "16:00", slots: ["09:00"] };

const REGULAR_WEEKLY: WeeklySchedule = [CLOSED, WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY, CLOSED, SATURDAY];
const DELIVERY_WEEKLY: WeeklySchedule = [
  CLOSED,
  WEEKDAY,
  DELIVERY_MORNING,
  DELIVERY_MORNING,
  DELIVERY_MORNING,
  CLOSED,
  SATURDAY,
];

export const DEFAULT_SCHEDULE: ScheduleConfig = {
  weekly: { REGULAR: REGULAR_WEEKLY, DELIVERY: DELIVERY_WEEKLY },
  overrides: { REGULAR: {}, DELIVERY: {} },
};
