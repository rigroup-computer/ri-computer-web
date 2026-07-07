import type { AdminDashboardStats } from "@/src/lib/sdk/orders";

import { DashboardHeader } from "./dashboard-header";
import { DashboardNavLinks } from "./dashboard-nav-links";
import { InventorySoldPreview } from "./inventory-sold-preview";
import { LaptopCarousel } from "./laptop-carousel";
import { OrdersChart } from "./orders-chart";
import { QuickActions } from "./quick-actions";
import { RecentOrdersList } from "./recent-orders-list";
import { RecentOrdersTable } from "./recent-orders-table";
import { StatsCarousel } from "./stats-carousel";
import { SupportCard } from "./support-card";

type DashboardContentProps = Readonly<{
  stats: AdminDashboardStats;
  waHref: string | null;
}>;

export function DashboardContent({ stats, waHref }: DashboardContentProps) {
  return (
    <div className="space-y-5 lg:space-y-6">
      <DashboardHeader />

      <StatsCarousel stats={stats.counts} />

      <QuickActions />

      <DashboardNavLinks />

      <RecentOrdersList orders={stats.recentOrders} />

      <div className="hidden gap-6 lg:grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
        <RecentOrdersTable orders={stats.recentOrders} />
        <aside className="space-y-4">
          <OrdersChart counts={stats.counts} />
          <InventorySoldPreview items={stats.inventoryPreview} />
        </aside>
      </div>

      <LaptopCarousel items={stats.inventoryPreview} />
    </div>
  );
}
