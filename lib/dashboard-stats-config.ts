import type { AdminDashboardStats } from "@/lib/admin-dashboard-stats";

export type DashboardStatIconTone = "blue" | "amber" | "green" | "neutral";

export type DashboardStatTrend = {
  label: string;
  designTone: "positive" | "negative";
  isMock?: boolean;
};

export type DashboardStatTag = {
  label: string;
  tone: "positive" | "negative" | "neutral";
  isMock?: boolean;
};

export type DashboardStatItem = {
  label: string;
  value: string | number;
  icon: string;
  iconTone: DashboardStatIconTone;
  href?: string;
  isPlaceholder?: boolean;
  trend?: DashboardStatTrend;
  tag?: DashboardStatTag;
};

export type DashboardStatItems = {
  mobile: DashboardStatItem[];
  desktop: DashboardStatItem[];
};

export function buildDashboardStatItems(
  counts: AdminDashboardStats["counts"],
): DashboardStatItems {
  const totalPesanan = counts.antrian + counts.proses + counts.selesai;
  const pesananAktif = counts.antrian + counts.proses;

  return {
    mobile: [
      {
        label: "Total Pesanan",
        value: totalPesanan,
        icon: "mdi:clipboard-list-outline",
        iconTone: "blue",
        href: "/admin/orders",
        trend: { label: "+12%", designTone: "positive", isMock: true },
      },
      {
        label: "Pending",
        value: counts.antrian,
        icon: "mdi:clock-outline",
        iconTone: "amber",
        href: "/admin/orders",
        trend: { label: "-5%", designTone: "positive", isMock: true },
      },
      {
        label: "Selesai",
        value: counts.selesai,
        icon: "mdi:package-variant-closed",
        iconTone: "green",
        href: "/admin/orders?tab=selesai",
        trend: { label: "+18%", designTone: "positive", isMock: true },
      },
    ],
    desktop: [
      {
        label: "Total Pendapatan",
        value: "—",
        icon: "mdi:trending-up",
        iconTone: "neutral",
        isPlaceholder: true,
        tag: { label: "+12.5%", tone: "positive", isMock: true },
      },
      {
        label: "Pesanan Aktif",
        value: pesananAktif,
        icon: "mdi:clipboard-list-outline",
        iconTone: "neutral",
        href: "/admin/orders?tab=proses",
        tag: { label: "+2 hari ini", tone: "neutral", isMock: true },
      },
      {
        label: "Unit Selesai",
        value: counts.selesai,
        icon: "mdi:package-variant-closed",
        iconTone: "neutral",
        href: "/admin/orders?tab=selesai",
        tag: { label: "+5%", tone: "positive", isMock: true },
      },
      {
        label: "Kepuasan Layanan",
        value: "—",
        icon: "mdi:store-outline",
        iconTone: "neutral",
        isPlaceholder: true,
        tag: { label: "-0.1%", tone: "negative", isMock: true },
      },
    ],
  };
}
