import { VisitScheduleStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { sortOrderListRows } from "@/lib/admin-orders-sort";
import type { OrderListRowData } from "@/components/admin/orders/order-row-data";
import {
  isScheduleAwaitingCustomer,
  isScheduleGateActive,
  isSchedulePendingAdminAction,
  visitScheduleTableLabel,
} from "@/lib/admin-visit-schedule-gate";

function row(
  overrides: Partial<OrderListRowData> & Pick<OrderListRowData, "id">,
): OrderListRowData {
  return {
    id: overrides.id,
    trackingId: overrides.trackingId ?? "RC-TEST",
    customerName: overrides.customerName ?? "Test",
    customerPhone: overrides.customerPhone ?? "08123456789",
    issue: overrides.issue ?? "",
    serviceType: overrides.serviceType ?? "HOME_SERVICE",
    laptopBrand: overrides.laptopBrand ?? null,
    laptopModel: overrides.laptopModel ?? null,
    bucket: overrides.bucket ?? "antrian",
    visitScheduleStatus:
      overrides.visitScheduleStatus ?? VisitScheduleStatus.REQUESTED,
    confirmedVisitAt: overrides.confirmedVisitAt ?? null,
    preferredVisitAt: overrides.preferredVisitAt ?? null,
    createdAt: overrides.createdAt ?? new Date("2026-07-01T00:00:00Z"),
    updatedAt: overrides.updatedAt ?? new Date("2026-07-01T00:00:00Z"),
  };
}

describe("admin-visit-schedule-gate", () => {
  it("activates gate until schedule is CONFIRMED", () => {
    expect(
      isScheduleGateActive({ visitScheduleStatus: VisitScheduleStatus.REQUESTED }),
    ).toBe(true);
    expect(
      isScheduleGateActive({ visitScheduleStatus: VisitScheduleStatus.DECLINED }),
    ).toBe(true);
    expect(
      isScheduleGateActive({ visitScheduleStatus: VisitScheduleStatus.RESCHEDULED }),
    ).toBe(true);
    expect(
      isScheduleGateActive({ visitScheduleStatus: VisitScheduleStatus.CONFIRMED }),
    ).toBe(false);
    expect(
      isSchedulePendingAdminAction({ visitScheduleStatus: VisitScheduleStatus.REQUESTED }),
    ).toBe(true);
    expect(
      isSchedulePendingAdminAction({ visitScheduleStatus: VisitScheduleStatus.DECLINED }),
    ).toBe(true);
    expect(
      isSchedulePendingAdminAction({ visitScheduleStatus: VisitScheduleStatus.RESCHEDULED }),
    ).toBe(false);
    expect(
      isScheduleAwaitingCustomer({ visitScheduleStatus: VisitScheduleStatus.RESCHEDULED }),
    ).toBe(true);
  });

  it("formats declined table label with preferred date", () => {
    const preferred = new Date("2026-07-08T07:00:00.000Z");
    const label = visitScheduleTableLabel({
      visitScheduleStatus: VisitScheduleStatus.DECLINED,
      confirmedVisitAt: null,
      preferredVisitAt: preferred,
    });
    expect(label).toContain("Perlu diatur ulang");
    expect(label).toContain("WIB");
  });

  it("formats table label for pending schedule with preferred date", () => {
    const preferred = new Date("2026-07-08T07:00:00.000Z");
    const label = visitScheduleTableLabel({
      visitScheduleStatus: VisitScheduleStatus.REQUESTED,
      confirmedVisitAt: null,
      preferredVisitAt: preferred,
    });
    expect(label).toContain("Menunggu konfirmasi");
    expect(label).toContain("WIB");
  });

  it("sorts unresolved schedules before CONFIRMED", () => {
    const pending = row({
      id: "pending",
      visitScheduleStatus: VisitScheduleStatus.REQUESTED,
      updatedAt: new Date("2026-07-01T00:00:00Z"),
    });
    const declined = row({
      id: "declined",
      visitScheduleStatus: VisitScheduleStatus.DECLINED,
      updatedAt: new Date("2026-07-02T00:00:00Z"),
    });
    const rescheduled = row({
      id: "rescheduled",
      visitScheduleStatus: VisitScheduleStatus.RESCHEDULED,
      updatedAt: new Date("2026-07-09T00:00:00Z"),
    });
    const confirmed = row({
      id: "confirmed",
      visitScheduleStatus: VisitScheduleStatus.CONFIRMED,
      updatedAt: new Date("2026-07-10T00:00:00Z"),
    });

    const sorted = sortOrderListRows(
      [confirmed, rescheduled, declined, pending],
      "updatedAt-desc",
    );
    expect(sorted.map((item) => item.id)).toEqual([
      "declined",
      "pending",
      "rescheduled",
      "confirmed",
    ]);
  });
});
