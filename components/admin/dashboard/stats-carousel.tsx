import type { AdminDashboardStats } from "@/src/lib/sdk/orders";
import { buildDashboardStatItems } from "@/lib/dashboard-stats-config";

import { StatCard } from "./stat-card";

type StatsCarouselProps = Readonly<{
  stats: AdminDashboardStats["counts"];
}>;

export function StatsCarousel({ stats }: StatsCarouselProps) {
  const { mobile, desktop } = buildDashboardStatItems(stats);

  return (
    <section aria-label="Ringkasan statistik">
      <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 lg:hidden">
        {mobile.map((item) => (
          <div
            key={item.label}
            className="w-[140px] shrink-0 snap-start"
          >
            <StatCard
              label={item.label}
              value={item.value}
              icon={item.icon}
              iconTone={item.iconTone}
              layout="carousel"
              href={item.href}
              isPlaceholder={item.isPlaceholder}
              trend={item.trend}
            />
          </div>
        ))}
      </div>

      <div
        className="hidden gap-4 lg:grid lg:grid-cols-4"
        aria-label="Metrik dasbor"
      >
        {desktop.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            iconTone={item.iconTone}
            layout="grid"
            href={item.href}
            isPlaceholder={item.isPlaceholder}
            tag={item.tag}
          />
        ))}
      </div>
    </section>
  );
}
