import { ServiceStatus } from "@prisma/client";

import { serviceStatusLabel } from "@/lib/service-status-label";

/** Urutan status di UI admin & tracking pelanggan. */
export const SERVICE_ORDER_STATUS_FLOW: ServiceStatus[] = [
  ServiceStatus.RECEIVED,
  ServiceStatus.REPAIRING,
  ServiceStatus.READY,
  ServiceStatus.COMPLETED,
];

const ALLOWED_TRANSITIONS: Record<ServiceStatus, readonly ServiceStatus[]> = {
  [ServiceStatus.RECEIVED]: [ServiceStatus.REPAIRING],
  [ServiceStatus.REPAIRING]: [ServiceStatus.READY, ServiceStatus.COMPLETED],
  [ServiceStatus.READY]: [ServiceStatus.REPAIRING, ServiceStatus.COMPLETED],
  [ServiceStatus.COMPLETED]: [],
};

/** Legacy rows may still carry CHECKING until migration completes. */
export function normalizeServiceStatus(status: string): ServiceStatus {
  if (status === "CHECKING") {
    return ServiceStatus.REPAIRING;
  }
  if (
    (SERVICE_ORDER_STATUS_FLOW as readonly string[]).includes(status)
  ) {
    return status as ServiceStatus;
  }
  return ServiceStatus.RECEIVED;
}

export function getAllowedNextStatuses(current: string): ServiceStatus[] {
  const normalized = normalizeServiceStatus(current);
  return [...ALLOWED_TRANSITIONS[normalized]];
}

export function isStatusTransitionAllowed(
  from: string,
  to: ServiceStatus,
): boolean {
  const normalizedFrom = normalizeServiceStatus(from);
  if (normalizedFrom === to) {
    return true;
  }
  return ALLOWED_TRANSITIONS[normalizedFrom].includes(to);
}

export function assertStatusTransitionAllowed(
  from: string,
  to: ServiceStatus,
): void {
  if (isStatusTransitionAllowed(from, to)) {
    return;
  }

  const fromLabel = serviceStatusLabel(normalizeServiceStatus(from));
  const toLabel = serviceStatusLabel(to);

  if (normalizeServiceStatus(from) === ServiceStatus.COMPLETED) {
    throw new Error("Order yang sudah Selesai tidak dapat diubah statusnya.");
  }

  throw new Error(
    `Perubahan status dari "${fromLabel}" ke "${toLabel}" tidak diizinkan.`,
  );
}

export function serviceStatusMilestoneRank(status: string): number {
  switch (normalizeServiceStatus(status)) {
    case ServiceStatus.RECEIVED:
      return 0;
    case ServiceStatus.REPAIRING:
      return 1;
    case ServiceStatus.READY:
      return 2;
    case ServiceStatus.COMPLETED:
      return 3;
    default:
      return 0;
  }
}
