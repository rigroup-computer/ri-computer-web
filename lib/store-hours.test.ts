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

  it("includes Saturday slot through 16:00", () => {
    const slots = getAvailableTimeSlots(
      "2026-04-25",
      new Date("2026-04-24T17:00:00.000Z"),
    );
    expect(slots).toContain("16:00");
    expect(slots.at(-1)).toBe("16:00");
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
});
