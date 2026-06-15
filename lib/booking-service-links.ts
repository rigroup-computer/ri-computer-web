import type { JenisQueryValue } from "@/lib/admin-order-status-display";
import { getShopWhatsAppNumber, whatsappHref } from "@/lib/whatsapp";

export const HOME_SERVICE_MESSAGE =
  "Halo Ri Computer, saya ingin booking Home Service. Mohon dibantu.";

export function bookingPageHref(
  jenis: Extract<JenisQueryValue, "store" | "delivery">,
): string {
  return `/booking?jenis=${jenis}`;
}

export function homeServiceWhatsAppHref(): string | null {
  return whatsappHref(getShopWhatsAppNumber(), HOME_SERVICE_MESSAGE);
}
