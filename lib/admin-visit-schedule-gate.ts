import { VisitScheduleStatus } from "@prisma/client";

import { formatVisitDateTimeId } from "@/lib/store-hours";

type VisitScheduleGateFields = Readonly<{
  visitScheduleStatus: VisitScheduleStatus;
}>;

type VisitScheduleFields = Readonly<{
  visitScheduleStatus: VisitScheduleStatus;
  confirmedVisitAt: Date | null;
  preferredVisitAt: Date | null;
}>;

export function isScheduleGateActive(order: VisitScheduleGateFields): boolean {
  return (
    order.visitScheduleStatus === VisitScheduleStatus.REQUESTED ||
    order.visitScheduleStatus === VisitScheduleStatus.DECLINED ||
    order.visitScheduleStatus === VisitScheduleStatus.RESCHEDULED
  );
}

/** Admin must act (confirm / reject / propose). */
export function isSchedulePendingAdminAction(
  order: VisitScheduleGateFields,
): boolean {
  return (
    order.visitScheduleStatus === VisitScheduleStatus.REQUESTED ||
    order.visitScheduleStatus === VisitScheduleStatus.DECLINED
  );
}

/** @deprecated Use isSchedulePendingAdminAction */
export function isSchedulePendingConfirmation(
  order: VisitScheduleGateFields,
): boolean {
  return isSchedulePendingAdminAction(order);
}

/** Admin proposed a slot; waiting on customer before service status can proceed. */
export function isScheduleAwaitingCustomer(
  order: VisitScheduleGateFields,
): boolean {
  return order.visitScheduleStatus === VisitScheduleStatus.RESCHEDULED;
}

export function scheduleGateHeaderSubtitle(
  order: VisitScheduleGateFields,
): string | null {
  switch (order.visitScheduleStatus) {
    case VisitScheduleStatus.REQUESTED:
      return "Perlu konfirmasi jadwal";
    case VisitScheduleStatus.DECLINED:
      return "Jadwal perlu diatur ulang";
    case VisitScheduleStatus.RESCHEDULED:
      return "Menunggu konfirmasi pelanggan";
    default:
      return null;
  }
}

export function visitScheduleTableLabel(order: VisitScheduleFields): string {
  const { visitScheduleStatus, confirmedVisitAt, preferredVisitAt } = order;

  switch (visitScheduleStatus) {
    case VisitScheduleStatus.REQUESTED: {
      const date = preferredVisitAt;
      return date
        ? `Menunggu konfirmasi · ${formatVisitDateTimeId(date)} WIB`
        : "Menunggu konfirmasi";
    }
    case VisitScheduleStatus.CONFIRMED: {
      const date = confirmedVisitAt ?? preferredVisitAt;
      return date ? `${formatVisitDateTimeId(date)} WIB` : "Jadwal dikonfirmasi";
    }
    case VisitScheduleStatus.RESCHEDULED: {
      const date = confirmedVisitAt ?? preferredVisitAt;
      return date
        ? `Menunggu pelanggan · ${formatVisitDateTimeId(date)} WIB`
        : "Jadwal diubah admin";
    }
    case VisitScheduleStatus.DECLINED: {
      const date = preferredVisitAt;
      return date
        ? `Perlu diatur ulang · ${formatVisitDateTimeId(date)} WIB`
        : "Perlu diatur ulang";
    }
  }
}
