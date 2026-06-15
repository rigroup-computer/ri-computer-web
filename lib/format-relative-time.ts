const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat("id-ID", {
  numeric: "auto",
});

const DIVISIONS: ReadonlyArray<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> =
  [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ];

export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  let delta = (date.getTime() - now.getTime()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(delta) < division.amount) {
      return RELATIVE_FORMATTER.format(Math.round(delta), division.unit);
    }
    delta /= division.amount;
  }

  return RELATIVE_FORMATTER.format(Math.round(delta), "year");
}

const SHORT_UNITS: ReadonlyArray<{
  amount: number;
  suffix: string;
}> = [
  { amount: 60, suffix: "dtk" },
  { amount: 60, suffix: "m" },
  { amount: 24, suffix: "j" },
  { amount: 7, suffix: "h" },
  { amount: 4.34524, suffix: "mg" },
  { amount: 12, suffix: "bln" },
  { amount: Number.POSITIVE_INFINITY, suffix: "thn" },
];

/** Ringkas untuk meta dasbor, mis. `2j yang lalu`. */
export function formatRelativeTimeShort(
  date: Date,
  now: Date = new Date(),
): string {
  const diffSec = Math.round((date.getTime() - now.getTime()) / 1000);
  const past = diffSec <= 0;
  let delta = Math.abs(diffSec);

  if (delta < 45) {
    return "baru saja";
  }

  for (const { amount, suffix } of SHORT_UNITS) {
    if (delta < amount) {
      const value = Math.max(1, Math.round(delta));
      return past ? `${value}${suffix} yang lalu` : `dalam ${value}${suffix}`;
    }
    delta /= amount;
  }

  const value = Math.max(1, Math.round(delta));
  return past ? `${value}thn yang lalu` : `dalam ${value}thn`;
}

const ORDER_DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Tanggal absolut untuk baris pesanan, mis. `10 Mei 2024`. */
export function formatOrderDateId(date: Date): string {
  return ORDER_DATE_FORMATTER.format(date);
}

const ORDER_TIME_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Tanggal + jam untuk tabel desktop, mis. `26 Mei 2026 | 02:45`. */
export function formatOrderDateTimeId(date: Date): string {
  const time = ORDER_TIME_FORMATTER.format(date).replace(/\./g, ":");
  return `${ORDER_DATE_FORMATTER.format(date)} | ${time}`;
}
