import type { ServiceStatus, ServiceType } from "@prisma/client";

export type AdminStatusBucket = "antrian" | "proses" | "selesai";

const BUCKET_LABELS: Record<AdminStatusBucket, string> = {
  antrian: "Antrian",
  proses: "Proses",
  selesai: "Selesai",
};

const BUCKET_STYLES: Record<AdminStatusBucket, string> = {
  antrian: "bg-amber-50 text-amber-800 ring-amber-200/80",
  proses: "bg-blue-50 text-blue-800 ring-blue-200/80",
  selesai: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
};

const DASHBOARD_BADGE_STYLES: Record<AdminStatusBucket, string> = {
  antrian:
    "bg-[rgba(211,47,47,0.1)] text-[#d32f2f] ring-1 ring-[rgba(211,47,47,0.2)]",
  proses: "bg-transparent text-[#171a1f] ring-1 ring-[#dee1e6]",
  selesai: "bg-transparent text-[#171a1f] ring-1 ring-[#dee1e6]",
};

const ANTRIAN_STATUSES: readonly ServiceStatus[] = ["RECEIVED"];
const PROSES_STATUSES: readonly ServiceStatus[] = ["REPAIRING", "READY"];
const SELESAI_STATUSES: readonly ServiceStatus[] = ["COMPLETED"];

export function getAdminStatusBucket(status: ServiceStatus): AdminStatusBucket {
  if (ANTRIAN_STATUSES.includes(status)) return "antrian";
  if (SELESAI_STATUSES.includes(status)) return "selesai";
  return "proses";
}

export function adminStatusBucketLabel(bucket: AdminStatusBucket): string {
  return BUCKET_LABELS[bucket];
}

export function adminStatusBucketClassName(bucket: AdminStatusBucket): string {
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${BUCKET_STYLES[bucket]}`;
}

/** Pill status di daftar/tabel dasbor (Figma mobile & desktop). */
export function adminStatusDashboardBadgeClassName(
  bucket: AdminStatusBucket,
): string {
  return `inline-flex shrink-0 items-center rounded-lg px-2 py-0.5 text-2xs font-semibold ${DASHBOARD_BADGE_STYLES[bucket]}`;
}

const DASHBOARD_TABLE_BUCKET_STYLES: Record<AdminStatusBucket, string> = {
  antrian: "bg-[#eff6ff] border-[#dbeafe] text-[#2563eb]",
  proses: "bg-[#fffbeb] border-[#fef3c7] text-[#d97706]",
  selesai: "bg-[#f0fdf4] border-[#dcfce7] text-[#16a34a]",
};

/** Badge tabel desktop (Figma 62:465). */
export function adminStatusBucketTableClassName(
  bucket: AdminStatusBucket,
): string {
  return `inline-flex h-6 items-center rounded-xl border px-2.5 text-xxs font-medium ${DASHBOARD_TABLE_BUCKET_STYLES[bucket]}`;
}

const ORDERS_PAGE_BADGE_STYLES: Record<AdminStatusBucket, string> = {
  antrian: "border border-[#fef08a] bg-[#fef9c3] text-[#a16207]",
  proses: "border border-[#bfdbfe] bg-[#dbeafe] text-[#1d4ed8]",
  selesai: "border border-[#bbf7d0] bg-[#dcfce7] text-[#15803d]",
};

const ORDERS_PAGE_BADGE_SPRITE: Record<AdminStatusBucket, string> = {
  antrian: "icon-process--antrian",
  proses: "icon-process--proses",
  selesai: "icon-process--selesai",
};

/** Badge daftar pesanan mobile (orders-page.pen). */
export function adminStatusOrdersPageBadgeClassName(
  bucket: AdminStatusBucket,
): string {
  return `inline-flex h-5 shrink-0 items-center gap-1 rounded-[10px] px-1.5 text-[10px] font-medium ${ORDERS_PAGE_BADGE_STYLES[bucket]}`;
}

const ORDERS_TABLE_BADGE_STYLES: Record<AdminStatusBucket, string> = {
  antrian: "border border-[#dee1e6] bg-transparent text-[#171a1f]",
  proses: "border border-[#1a73e8]/20 bg-[#1a73e8]/10 text-[#1a73e8]",
  selesai: "border border-[#dee1e6] bg-transparent text-[#171a1f]",
};

/** Badge status tabel desktop halaman pesanan. */
export function adminStatusOrdersTableBadgeClassName(
  bucket: AdminStatusBucket,
): string {
  return `inline-flex h-[22px] items-center rounded-[11px] px-2.5 text-xs font-semibold ${ORDERS_TABLE_BADGE_STYLES[bucket]}`;
}

export function adminStatusOrdersPageBadgeSpriteClass(
  bucket: AdminStatusBucket,
): string {
  return ORDERS_PAGE_BADGE_SPRITE[bucket];
}

export type OrdersStatusTab = "semua" | AdminStatusBucket;

export function ordersStatusTabFromQuery(
  tab: string | undefined,
): OrdersStatusTab {
  if (tab === "antrian" || tab === "proses" || tab === "selesai") {
    return tab;
  }
  return "semua";
}

export function statusWhereForOrdersTab(
  tab: OrdersStatusTab,
): { status?: { in: ServiceStatus[] } } | Record<string, never> {
  if (tab === "semua") {
    return {};
  }
  return ADMIN_STATUS_WHERE[tab];
}

export function formatTrackingIdDisplay(trackingId: string): string {
  return `#${trackingId}`;
}

export function serviceTypeAdminLabel(type: ServiceType): string {
  switch (type) {
    case "HOME_SERVICE":
      return "Home Service";
    case "DELIVERY":
      return "Antar Jemput";
    case "REGULAR":
      return "Datang ke Toko";
    default:
      return type;
  }
}

export type JenisQueryValue = "store" | "delivery" | "home";

export function serviceTypeFromJenisQuery(
  jenis: string | undefined,
): ServiceType | undefined {
  switch (jenis) {
    case "store":
      return "REGULAR";
    case "delivery":
      return "DELIVERY";
    case "home":
      return "HOME_SERVICE";
    default:
      return undefined;
  }
}

export function jenisQueryFromServiceType(
  type: ServiceType,
): JenisQueryValue | undefined {
  switch (type) {
    case "REGULAR":
      return "store";
    case "DELIVERY":
      return "delivery";
    case "HOME_SERVICE":
      return "home";
    default:
      return undefined;
  }
}

export const ADMIN_STATUS_WHERE = {
  antrian: { status: { in: [...ANTRIAN_STATUSES] as ServiceStatus[] } },
  proses: { status: { in: [...PROSES_STATUSES] as ServiceStatus[] } },
  selesai: { status: { in: [...SELESAI_STATUSES] as ServiceStatus[] } },
};
