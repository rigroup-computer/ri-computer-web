import { ServiceStatus } from "@prisma/client";

/** Urutan opsi status di UI admin (sinkron enum Prisma ServiceStatus). */
export const SERVICE_ORDER_STATUS_FLOW: ServiceStatus[] = [
  ServiceStatus.RECEIVED,
  ServiceStatus.CHECKING,
  ServiceStatus.REPAIRING,
  ServiceStatus.READY,
  ServiceStatus.COMPLETED,
];
