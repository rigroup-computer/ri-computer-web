import { Icon } from "@iconify/react";
import Link from "next/link";

import type {
  DashboardStatIconTone,
  DashboardStatTag,
  DashboardStatTrend,
} from "@/lib/dashboard-stats-config";

const ICON_TONE_BG: Record<DashboardStatIconTone, string> = {
  blue: "bg-[#dbeafe]",
  amber: "bg-[#fef3c7]",
  green: "bg-[#dcfce7]",
  neutral: "bg-[#f1f6fe]",
};

const ICON_TONE_FG: Record<DashboardStatIconTone, string> = {
  blue: "text-primary",
  amber: "text-amber-600",
  green: "text-green-600",
  neutral: "text-primary",
};

function trendToneClass(designTone: DashboardStatTrend["designTone"]): string {
  return designTone === "positive" ? "text-[#16a34a]" : "text-[#dc2626]";
}

function tagPillClass(tone: DashboardStatTag["tone"]): string {
  if (tone === "positive") return "bg-[#dcfce7] text-[#15803d]";
  if (tone === "negative") return "bg-[#fee2e2] text-[#b91c1c]";
  return "bg-slate-100 text-[#565d6d]";
}

type StatCardProps = Readonly<{
  label: string;
  value: string | number;
  icon: string;
  iconTone: DashboardStatIconTone;
  layout: "carousel" | "grid";
  href?: string;
  isPlaceholder?: boolean;
  trend?: DashboardStatTrend;
  tag?: DashboardStatTag;
}>;

export function StatCard({
  label,
  value,
  icon,
  iconTone,
  layout,
  href,
  isPlaceholder = false,
  trend,
  tag,
}: StatCardProps) {
  const valueClass =
    layout === "carousel"
      ? "text-2xl font-bold tabular-nums leading-8"
      : "text-xl font-bold tabular-nums leading-7";

  const valueColor = isPlaceholder ? "text-mate-black/35" : "text-mate-black";

  const iconWrapClass =
    layout === "carousel"
      ? `flex size-10 shrink-0 items-center justify-center rounded-[20px] ${ICON_TONE_BG[iconTone]}`
      : `flex size-9 shrink-0 items-center justify-center rounded-[10px] ${ICON_TONE_BG[iconTone]}`;

  const iconSize = layout === "carousel" ? 20 : 20;

  const inner = (
    <article
      className={`relative flex flex-col rounded-[10px] bg-white p-4 custom-shadow-sm ${
        layout === "carousel" ? "min-h-[155px]" : "min-h-[140px]"
      }`}
    >
      {layout === "grid" && tag ? (
        <span
          className={`absolute right-4 top-4 shrink-0 rounded-[11px] px-2 py-0.5 text-2xs font-semibold ${tagPillClass(tag.tone)}`}
          title={tag.isMock ? "Ilustrasi desain—data tren belum tersedia" : undefined}
        >
          {tag.label}
        </span>
      ) : null}

      <span className={iconWrapClass} aria-hidden>
        <Icon
          icon={icon}
          width={iconSize}
          height={iconSize}
          className={ICON_TONE_FG[iconTone]}
        />
      </span>

      <p className="mt-3 text-xs font-medium uppercase tracking-[0.6px] text-[#565d6d]">
        {label}
      </p>

      <p className={`mt-0.5 ${valueClass} ${valueColor}`}>{value}</p>

      {isPlaceholder ? (
        <span className="sr-only">Data belum tersedia</span>
      ) : null}

      {layout === "carousel" && trend ? (
        <p
          className={`mt-auto flex items-center gap-1 pt-3 text-2xs font-semibold tabular-nums ${trendToneClass(trend.designTone)}`}
          title={
            trend.isMock
              ? "Ilustrasi desain—data tren belum tersedia"
              : undefined
          }
        >
          <Icon icon="mdi:trending-up" width={12} height={12} aria-hidden />
          {trend.label}
        </p>
      ) : null}
    </article>
  );

  const linkLabel = isPlaceholder
    ? `${label}: ${value}, data belum tersedia`
    : `${label}: ${value}`;

  if (href) {
    return (
      <Link
        href={href}
        aria-label={linkLabel}
        className="block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
