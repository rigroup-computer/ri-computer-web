import {
  BOOKING_FIELD_ORDER,
  type BookingFieldKey,
} from "@/lib/booking-form-validation";
import { formatOrderDateId } from "@/lib/format-relative-time";
import { toast } from "sonner";

export const BRAND_SUGGESTIONS = [
  "Lenovo",
  "HP",
  "ASUS",
  "Acer",
  "Dell",
  "Toshiba",
  "Apple",
  "MSI",
  "Samsung",
  "Huawei",
] as const;

export const FIELD_LIMITS = {
  laptopBrand: 80,
  laptopModel: 120,
  deviceSpecs: 160,
  issue: 2000,
  customerName: 100,
  customerPhone: 13,
  visitAddress: 500,
  customerCity: 100,
} as const;

export const inputClass =
  "h-12 w-full rounded-sm border px-3 text-sm outline-none focus:ring-1";
export const inputBorderClass = "border-slate-300 ring-primary/50";
export const textareaClass =
  "mt-2 min-h-[120px] w-full rounded-sm border px-3 py-3 text-sm outline-none focus:ring-1";
export const textareaBorderClass = "border-slate-300 ring-primary/50";
export const labelClass =
  "text-xs font-semibold uppercase tracking-wide text-slate-600";

export function fieldBorderClass(
  hasError: boolean,
  base: string,
  borderClass: string,
): string {
  return hasError
    ? `${base} border-red-500 ring-red-500/50`
    : `${base} ${borderClass}`;
}

const SCROLL_TOP_OFFSET_PX = 112;
const SCROLL_BOTTOM_OFFSET_PX = 88;

export function scrollFieldIntoView(element: HTMLElement): void {
  const rect = element.getBoundingClientRect();
  const absoluteTop = window.scrollY + rect.top;
  const viewportHeight = window.innerHeight;
  const visibleHeight = Math.max(
    240,
    viewportHeight - SCROLL_TOP_OFFSET_PX - SCROLL_BOTTOM_OFFSET_PX,
  );
  const visibleCenter = SCROLL_TOP_OFFSET_PX + visibleHeight / 2;
  const targetScroll = absoluteTop + rect.height / 2 - visibleCenter;

  window.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: "smooth",
  });
}

export function focusFirstInvalidField(fieldErrors: Record<string, string>): void {
  const firstKey = BOOKING_FIELD_ORDER.find((key) => key in fieldErrors);
  if (!firstKey) {
    return;
  }
  const element = document.getElementById(firstKey);
  if (!element) {
    return;
  }
  scrollFieldIntoView(element);
  element.focus();
}

export function firstInvalidFieldError(
  fieldErrors: Record<string, string>,
): { key: BookingFieldKey; errors: Record<string, string> } | null {
  const firstKey = BOOKING_FIELD_ORDER.find(
    (key): key is BookingFieldKey => key in fieldErrors,
  );
  if (!firstKey) {
    return null;
  }
  return { key: firstKey, errors: { [firstKey]: fieldErrors[firstKey] } };
}

export function openWhatsApp(href: string | null, invalidMessage: string): void {
  if (!href) {
    toast.error(invalidMessage);
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}

export function bookingPaymentConfirmationMessage(trackingId: string): string {
  const bookingDate = formatOrderDateId(new Date());
  return [
    "Halo, Ri! Saya sudah booking untuk service",
    "",
    `ID Tracking: ${trackingId}`,
    `Tanggal Booking: ${bookingDate}`,
    "",
    "Berikut bukti pembayaran bookingnya.",
    "Tolong dicek ya. Hatur nuhun, Ri.",
  ].join("\n");
}
