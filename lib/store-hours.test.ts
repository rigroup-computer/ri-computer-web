import { describe, expect, it } from "vitest";
import {
  combineVisitDateTime,
  getAvailableTimeSlots,
  getWeekdayForIsoDate,
  isStoreOpenOnIsoDate,
} from "@/lib/store-hours";

describe("store-hours (Jaya Plaza)", () => {
  it("rejects Friday and Sunday", () => {
    expect(isStoreOpenOnIsoDate("2026-04-24")).toBe(false);
    expect(isStoreOpenOnIsoDate("2026-04-26")).toBe(false);
  });

  it("accepts Monday through Thursday and Saturday", () => {
    expect(isStoreOpenOnIsoDate("2026-04-20")).toBe(true);
    expect(isStoreOpenOnIsoDate("2026-04-25")).toBe(true);
  });

  it("returns weekday correctly for ISO dates", () => {
    expect(getWeekdayForIsoDate("2026-04-25")).toBe(6);
    expect(getWeekdayForIsoDate("2026-04-24")).toBe(5);
  });

  it("limits Saturday slots to 14:00 (excludes 15:00 and 16:00)", () => {
    const slots = getAvailableTimeSlots(
      "2026-04-25",
      new Date("2026-04-24T17:00:00.000Z"),
    );
    expect(slots).not.toContain("15:00");
    expect(slots).not.toContain("16:00");
    expect(slots.at(-1)).toBe("14:00");
  });

  it("limits Monday slots to 15:00 before close at 16:00", () => {
    const slots = getAvailableTimeSlots(
      "2026-04-20",
      new Date("2026-04-19T17:00:00.000Z"),
    );
    expect(slots).toContain("15:00");
    expect(slots).not.toContain("16:00");
  });

  it("filters today slots after current Jakarta time", () => {
    const now = new Date("2026-04-20T06:30:00.000Z");
    const slots = getAvailableTimeSlots("2026-04-20", now);
    expect(slots).not.toContain("10:00");
    expect(slots).not.toContain("13:00");
    expect(slots).toContain("14:00");
  });

  it("combines valid date and time into UTC datetime", () => {
    const combined = combineVisitDateTime("2026-04-25", "11:00");
    expect(combined).not.toBeNull();
    expect(combined?.toISOString()).toBe("2026-04-25T04:00:00.000Z");
  });

  it("adds 09:00 for DELIVERY on Selasa–Kamis", () => {
    const now = new Date("2026-04-19T17:00:00.000Z");
    // 2026-04-21 = Tuesday, 22 = Wed, 23 = Thu
    for (const iso of ["2026-04-21", "2026-04-22", "2026-04-23"] as const) {
      const slots = getAvailableTimeSlots(iso, now, "DELIVERY");
      expect(slots[0]).toBe("09:00");
      expect(slots).toContain("10:00");
      expect(slots).toContain("15:00");
    }
  });

  it("does not add 09:00 for DELIVERY on Senin or Sabtu", () => {
    const now = new Date("2026-04-19T17:00:00.000Z");
    expect(getAvailableTimeSlots("2026-04-20", now, "DELIVERY")).not.toContain(
      "09:00",
    );
    expect(getAvailableTimeSlots("2026-04-25", now, "DELIVERY")).not.toContain(
      "09:00",
    );
  });

  it("keeps REGULAR Tuesday slots starting at 10:00", () => {
    const slots = getAvailableTimeSlots(
      "2026-04-21",
      new Date("2026-04-19T17:00:00.000Z"),
      "REGULAR",
    );
    expect(slots).not.toContain("09:00");
    expect(slots[0]).toBe("10:00");
  });

  it("combines DELIVERY 09:00 on Tuesday into UTC datetime", () => {
    const combined = combineVisitDateTime("2026-04-21", "09:00", "DELIVERY");
    expect(combined).not.toBeNull();
    expect(combined?.toISOString()).toBe("2026-04-21T02:00:00.000Z");
  });

  it("rejects DELIVERY 09:00 on Monday", () => {
    expect(combineVisitDateTime("2026-04-20", "09:00", "DELIVERY")).toBeNull();
  });
});
