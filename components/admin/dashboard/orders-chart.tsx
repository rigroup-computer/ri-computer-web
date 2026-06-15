import type { AdminDashboardStats } from "@/lib/admin-dashboard-stats";

type OrdersChartProps = Readonly<{
  counts: Pick<AdminDashboardStats["counts"], "antrian" | "proses" | "selesai">;
}>;

function weeklyTrendPoints(
  total: number,
): ReadonlyArray<{ x: number; y: number }> {
  const base = Math.max(total, 4);
  const values = [
    base * 0.55,
    base * 0.7,
    base * 0.62,
    base * 0.95,
    base * 0.8,
    base * 0.88,
    base,
  ];
  const max = Math.max(...values, 1);
  const w = 280;
  const h = 80;
  const pad = 8;

  return values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (w - pad * 2),
    y: h - pad - (v / max) * (h - pad * 2),
  }));
}

function pointsToPath(points: ReadonlyArray<{ x: number; y: number }>): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

export function OrdersChart({ counts }: OrdersChartProps) {
  const total = counts.antrian + counts.proses + counts.selesai;
  const avgPerDay = Math.max(1, Math.round(total / 7));
  const points = weeklyTrendPoints(total);
  const linePath = pointsToPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} 80 L ${points[0]?.x ?? 0} 80 Z`;

  return (
    <section
      className="hidden rounded-[10px] bg-white p-4 custom-shadow-sm lg:block"
      aria-labelledby="orders-chart-heading"
    >
      <h2
        id="orders-chart-heading"
        className="text-sm font-bold text-[#171a1f]"
      >
        Tren Mingguan
      </h2>
      <p className="mt-0.5 text-xs text-[#565d6d]">
        Volume pesanan servis 7 hari terakhir
      </p>

      <svg
        viewBox="0 0 280 80"
        className="mt-4 h-20 w-full"
        role="img"
        aria-label={`Tren mingguan perkiraan, total ${total} pesanan`}
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1a73e8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#trendFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#1a73e8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[#dee1e6] pt-3">
        <div>
          <dt className="text-2xs font-semibold uppercase tracking-wide text-[#565d6d]">
            Total
          </dt>
          <dd className="text-lg font-bold tabular-nums text-[#171a1f]">
            {total}
          </dd>
        </div>
        <div>
          <dt className="text-2xs font-semibold uppercase tracking-wide text-[#565d6d]">
            Avg/hari
          </dt>
          <dd className="text-lg font-bold tabular-nums text-[#171a1f]">
            {avgPerDay}
          </dd>
        </div>
      </dl>
      <p className="sr-only">
        Grafik ilustrasi dari total pesanan aktif; data harian historis belum
        tersedia.
      </p>
    </section>
  );
}
