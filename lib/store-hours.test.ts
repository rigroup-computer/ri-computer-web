import { describe, expect, it } from "vitest";
import { DEFAULT_SCHEDULE } from "@/lib/schedule-defaults";
import {
  buildHoursDisplayRows,
  combineAdminVisitDateTime,
  combineVisitDateTime,
  generateHourlySlots,
  getAdminTimeSlotsForDate,
  getAvailableTimeSlots,
  getWeekdayForIsoDate,
  isStoreOpenOnIsoDate,
} from "@/lib/store-hours";
import type { ScheduleConfig } from "@/lib/types/schedule";

const config = DEFAULT_SCHEDULE;

describe("store-hours (Jaya Plaza)", () => {
  it("rejects Friday and Sunday", () => {
    expect(isStoreOpenOnIsoDate(config, "2026-04-24")).toBe(false);
    expect(isStoreOpenOnIsoDate(config, "2026-04-26")).toBe(false);
  });

  it("accepts Monday through Thursday and Saturday", () => {
    expect(isStoreOpenOnIsoDate(config, "2026-04-20")).toBe(true);
    expect(isStoreOpenOnIsoDate(config, "2026-04-25")).toBe(true);
  });

  it("returns weekday correctly for ISO dates", () => {
    expect(getWeekdayForIsoDate("2026-04-25")).toBe(6);
    expect(getWeekdayForIsoDate("2026-04-24")).toBe(5);
  });

  it("limits Saturday slots to 14:00 (excludes 15:00 and 16:00)", () => {
    const slots = getAvailableTimeSlots(
      config,
      "2026-04-25",
      new Date("2026-04-24T17:00:00.000Z"),
    );
    expect(slots).not.toContain("15:00");
    expect(slots).not.toContain("16:00");
    expect(slots.at(-1)).toBe("14:00");
  });

  it("limits Monday slots to 15:00 before close at 16:00", () => {
    const slots = getAvailableTimeSlots(
      config,
      "2026-04-20",
      new Date("2026-04-19T17:00:00.000Z"),
    );
    expect(slots).toContain("15:00");
    expect(slots).not.toContain("16:00");
  });

  it("filters today slots after current Jakarta time", () => {
    const now = new Date("2026-04-20T06:30:00.000Z");
    const slots = getAvailableTimeSlots(config, "2026-04-20", now);
    expect(slots).not.toContain("10:00");
    expect(slots).not.toContain("13:00");
    expect(slots).toContain("14:00");
  });

  it("combines valid date and time into UTC datetime", () => {
    const combined = combineVisitDateTime(config, "2099-04-25", "11:00");
    expect(combined).not.toBeNull();
    expect(combined?.toISOString()).toBe("2099-04-25T04:00:00.000Z");
  });

  it("offers only 09:00 for DELIVERY on Selasa–Kamis", () => {
    const now = new Date("2026-04-19T17:00:00.000Z");
    for (const iso of ["2026-04-21", "2026-04-22", "2026-04-23"] as const) {
      const slots = getAvailableTimeSlots(config, iso, now, "DELIVERY");
      expect(slots).toEqual(["09:00"]);
    }
  });

  it("does not offer 09:00 for DELIVERY on Senin or Sabtu", () => {
    const now = new Date("2026-04-19T17:00:00.000Z");
    const monday = getAvailableTimeSlots(config, "2026-04-20", now, "DELIVERY");
    const saturday = getAvailableTimeSlots(config, "2026-04-25", now, "DELIVERY");
    expect(monday).not.toContain("09:00");
    expect(monday[0]).toBe("10:00");
    expect(saturday).not.toContain("09:00");
    expect(saturday[0]).toBe("10:00");
  });

  it("keeps REGULAR Tuesday slots starting at 10:00", () => {
    const slots = getAvailableTimeSlots(
      config,
      "2026-04-21",
      new Date("2026-04-19T17:00:00.000Z"),
      "REGULAR",
    );
    expect(slots).not.toContain("09:00");
    expect(slots[0]).toBe("10:00");
  });

  it("rejects DELIVERY 10:00 on Tuesday (only 09:00)", () => {
    expect(combineVisitDateTime(config, "2099-04-21", "10:00", "DELIVERY")).toBeNull();
  });

  it("combines DELIVERY 09:00 on Tuesday into UTC datetime", () => {
    const combined = combineVisitDateTime(config, "2099-04-21", "09:00", "DELIVERY");
    expect(combined).not.toBeNull();
    expect(combined?.toISOString()).toBe("2099-04-21T02:00:00.000Z");
  });

  it("rejects DELIVERY 09:00 on Monday", () => {
    expect(combineVisitDateTime(config, "2099-04-20", "09:00", "DELIVERY")).toBeNull();
  });
});

describe("default schedule matches pre-admin behavior", () => {
  const farFuture = new Date("2026-04-19T17:00:00.000Z");
  // 2026-04-19 Sunday .. 2026-04-25 Saturday
  const weekIsoByWeekday = [
    "2026-04-19",
    "2026-04-20",
    "2026-04-21",
    "2026-04-22",
    "2026-04-23",
    "2026-04-24",
    "2026-04-25",
  ] as const;

  const fullWeekday = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
  const saturday = ["10:00", "11:00", "12:00", "13:00", "14:00"];

  const expected: Record<"REGULAR" | "DELIVERY", string[][]> = {
    REGULAR: [[], fullWeekday, fullWeekday, fullWeekday, fullWeekday, [], saturday],
    DELIVERY: [[], fullWeekday, ["09:00"], ["09:00"], ["09:00"], [], saturday],
  };

  for (const type of ["REGULAR", "DELIVERY"] as const) {
    it(`slots per weekday for ${type}`, () => {
      weekIsoByWeekday.forEach((iso, weekday) => {
        expect(getAvailableTimeSlots(config, iso, farFuture, type)).toEqual(
          expected[type][weekday],
        );
        expect(getAdminTimeSlotsForDate(config, iso, type)).toEqual(
          expected[type][weekday],
        );
      });
    });
  }

  it("treats HOME_SERVICE like REGULAR", () => {
    expect(getAvailableTimeSlots(config, "2026-04-21", farFuture, "HOME_SERVICE")).toEqual(
      fullWeekday,
    );
  });

  it("admin confirmation ignores the today cutoff", () => {
    const combined = combineAdminVisitDateTime(config, "2020-04-20", "10:00", "REGULAR");
    expect(combined?.toISOString()).toBe("2020-04-20T03:00:00.000Z");
  });

  it("produces the current homepage hours rows", () => {
    expect(buildHoursDisplayRows(config)).toEqual([
      { label: "Senin - Kamis", hours: "09.30 - 16.00 WIB", closed: false },
      { label: "Sabtu", hours: "09.30 - 16.30 WIB", closed: false },
      { label: "Jumat & Minggu", hours: "TUTUP", closed: true },
    ]);
  });
});

describe("date exceptions", () => {
  const withOverrides: ScheduleConfig = {
    weekly: DEFAULT_SCHEDULE.weekly,
    overrides: {
      REGULAR: {
        "2099-04-20": { isOpen: false, openTime: "09:30", closeTime: "16:00", slots: [] },
        "2099-04-24": {
          isOpen: true,
          openTime: "13:00",
          closeTime: "17:00",
          slots: ["16:00", "13:30", "13:30"],
        },
      },
      DELIVERY: {},
    },
  };

  it("closes a normally open day", () => {
    expect(isStoreOpenOnIsoDate(withOverrides, "2099-04-20")).toBe(false);
    expect(isStoreOpenOnIsoDate(withOverrides, "2099-04-20", "DELIVERY")).toBe(true);
  });

  it("opens a normally closed day with custom, normalized slots", () => {
    const now = new Date("2099-04-19T17:00:00.000Z");
    expect(getAvailableTimeSlots(withOverrides, "2099-04-24", now)).toEqual([
      "13:30",
      "16:00",
    ]);
    expect(combineVisitDateTime(withOverrides, "2099-04-24", "13:30")?.toISOString()).toBe(
      "2099-04-24T06:30:00.000Z",
    );
  });

  it("does not change homepage weekly rows", () => {
    expect(buildHoursDisplayRows(withOverrides)).toEqual(buildHoursDisplayRows(DEFAULT_SCHEDULE));
  });
});

describe("generateHourlySlots", () => {
  it("starts at the first full hour and ends by close", () => {
    expect(generateHourlySlots("09:30", "16:00")).toEqual([
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
    ]);
    expect(generateHourlySlots("16:00", "09:00")).toEqual([]);
  });
});
