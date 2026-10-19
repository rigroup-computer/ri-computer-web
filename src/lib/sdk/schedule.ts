/**
 * Booking schedule: weekly rules per service type + per-date exceptions.
 * Public reads go through a tagged cache; admin mutations must invalidate {@link SCHEDULE_CACHE_TAG}.
 */
import type { ScheduleDateOverride, ScheduleWeeklyRule } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SCHEDULE } from "@/lib/schedule-defaults";
import { formatIsoDateToday, getWeekdayForIsoDate } from "@/lib/store-hours";
import {
  SCHEDULE_SERVICE_TYPES,
  type DaySchedule,
  type ScheduleConfig,
  type ScheduleServiceType,
  type WeeklySchedule,
} from "@/lib/types/schedule";
import { prismaClient } from "./base";

export const SCHEDULE_CACHE_TAG = "schedule";

export type ScheduleOverrideRow = Readonly<{
  id: string;
  date: string;
  serviceType: ScheduleServiceType;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  slots: string[];
  note: string | null;
}>;

export type ScheduleOverrideInput = Readonly<{
  date: string;
  serviceTypes: readonly ScheduleServiceType[];
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  slots: readonly string[];
  note: string | null;
}>;

function isScheduleServiceType(value: string): value is ScheduleServiceType {
  return (SCHEDULE_SERVICE_TYPES as readonly string[]).includes(value);
}

function buildWeekly(rules: readonly ScheduleWeeklyRule[]): Record<ScheduleServiceType, WeeklySchedule> {
  const weekly: Record<ScheduleServiceType, DaySchedule[]> = {
    REGULAR: [...DEFAULT_SCHEDULE.weekly.REGULAR],
    DELIVERY: [...DEFAULT_SCHEDULE.weekly.DELIVERY],
  };
  for (const rule of rules) {
    if (!isScheduleServiceType(rule.serviceType) || rule.weekday < 0 || rule.weekday > 6) {
      continue;
    }
    weekly[rule.serviceType][rule.weekday] = {
      isOpen: rule.isOpen,
      openTime: rule.openTime,
      closeTime: rule.closeTime,
      slots: rule.slots,
    };
  }
  return weekly;
}

function toOverrideRow(row: ScheduleDateOverride): ScheduleOverrideRow | null {
  if (!isScheduleServiceType(row.serviceType)) {
    return null;
  }
  return {
    id: row.id,
    date: row.date,
    serviceType: row.serviceType,
    isOpen: row.isOpen,
    openTime: row.openTime,
    closeTime: row.closeTime,
    slots: row.slots,
    note: row.note,
  };
}

async function loadConfig(fromIsoDate: string): Promise<ScheduleConfig> {
  const [rules, overrideRows] = await Promise.all([
    prisma.scheduleWeeklyRule.findMany(),
    prisma.scheduleDateOverride.findMany({ where: { date: { gte: fromIsoDate } } }),
  ]);

  const weekly = buildWeekly(rules);
  const overrides: Record<ScheduleServiceType, Record<string, DaySchedule>> = {
    REGULAR: {},
    DELIVERY: {},
  };

  for (const raw of overrideRows) {
    const row = toOverrideRow(raw);
    if (!row) {
      continue;
    }
    const weekday = getWeekdayForIsoDate(row.date);
    if (weekday === null) {
      continue;
    }
    const base = weekly[row.serviceType][weekday];
    overrides[row.serviceType][row.date] = {
      isOpen: row.isOpen,
      openTime: row.openTime ?? base?.openTime ?? "09:00",
      closeTime: row.closeTime ?? base?.closeTime ?? "17:00",
      slots: row.slots,
      note: row.note,
    };
  }

  return { weekly, overrides };
}

const loadConfigCached = unstable_cache(loadConfig, ["schedule-config"], {
  tags: [SCHEDULE_CACHE_TAG],
  revalidate: 3600,
});

export const scheduleSdk = {
  /**
   * Resolved schedule for booking (weekly rules + exceptions from today onward).
   * Falls back to {@link DEFAULT_SCHEDULE} if the database is unreachable.
   */
  async getConfig(): Promise<ScheduleConfig> {
    try {
      return await loadConfigCached(formatIsoDateToday());
    } catch (err) {
      console.error("[scheduleSdk.getConfig] falling back to default schedule", err);
      return DEFAULT_SCHEDULE;
    }
  },

  /** Uncached weekly template for the admin editor. */
  async getWeekly(): Promise<ScheduleConfig["weekly"]> {
    return buildWeekly(await prisma.scheduleWeeklyRule.findMany());
  },

  async listOverridesFrom(fromIsoDate: string): Promise<ScheduleOverrideRow[]> {
    const rows = await prisma.scheduleDateOverride.findMany({
      where: { date: { gte: fromIsoDate } },
      orderBy: [{ date: "asc" }, { serviceType: "asc" }],
    });
    return rows.flatMap((row) => {
      const mapped = toOverrideRow(row);
      return mapped ? [mapped] : [];
    });
  },

  /** Replace all 7 weekdays for one service type. */
  async saveWeekly(serviceType: ScheduleServiceType, days: WeeklySchedule): Promise<void> {
    await prismaClient.execute("saveScheduleWeekly", () =>
      prisma.$transaction(
        days.map((day, weekday) => {
          const data = {
            isOpen: day.isOpen,
            openTime: day.openTime,
            closeTime: day.closeTime,
            slots: [...day.slots],
          };
          return prisma.scheduleWeeklyRule.upsert({
            where: { serviceType_weekday: { serviceType, weekday } },
            create: { serviceType, weekday, ...data },
            update: data,
          });
        }),
      ),
    );
  },

  /** Create or replace the exception for `date` on each selected service type. */
  async upsertOverride(input: ScheduleOverrideInput): Promise<void> {
    const data = {
      isOpen: input.isOpen,
      openTime: input.openTime,
      closeTime: input.closeTime,
      slots: [...input.slots],
      note: input.note,
    };
    await prismaClient.execute("upsertScheduleOverride", () =>
      prisma.$transaction(
        input.serviceTypes.map((serviceType) =>
          prisma.scheduleDateOverride.upsert({
            where: { date_serviceType: { date: input.date, serviceType } },
            create: { date: input.date, serviceType, ...data },
            update: data,
          }),
        ),
      ),
    );
  },

  async deleteOverride(id: string): Promise<void> {
    await prismaClient.execute("deleteScheduleOverride", () =>
      prisma.scheduleDateOverride.delete({ where: { id } }),
    );
  },
} as const;
