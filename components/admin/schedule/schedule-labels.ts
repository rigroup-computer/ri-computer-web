import type { ScheduleServiceType } from "@/lib/types/schedule";

export const SCHEDULE_SERVICE_LABELS: Readonly<Record<ScheduleServiceType, string>> = {
  REGULAR: "Datang ke Toko",
  DELIVERY: "Antar Jemput",
};
