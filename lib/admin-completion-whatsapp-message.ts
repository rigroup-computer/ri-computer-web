import type { ServiceType } from "@prisma/client";

import { serviceTypeAdminLabel } from "@/lib/admin-order-status-display";
import {
  sumCostLineItems,
  type ServiceOrderCostLineItem,
} from "@/lib/service-order-cost-items";
import { STORE_TIMEZONE } from "@/lib/store-hours";

export type CompletionWhatsAppOrder = Readonly<{
  customerName: string;
  customerPhone: string;
  laptopBrand: string | null;
  laptopModel: string | null;
  serviceType: ServiceType;
  createdAt: Date;
  costLineItems: readonly ServiceOrderCostLineItem[];
}>;

function formatIntakeDateId(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: STORE_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatLaptopLabel(
  brand: string | null,
  model: string | null,
): string {
  const parts = [brand?.trim(), model?.trim()].filter(
    (part): part is string => Boolean(part && part.length > 0),
  );
  return parts.length > 0 ? parts.join(" ") : "-";
}

function formatRp(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function buildCompletionWhatsAppMessage(
  order: CompletionWhatsAppOrder,
): string {
  const repairTotal = sumCostLineItems(order.costLineItems);
  const repairCostLabel =
    order.costLineItems.length > 0 ? formatRp(repairTotal) : "-";
  const totalDueLabel =
    order.costLineItems.length > 0 ? formatRp(repairTotal) : "-";

  return [
    "Halo ka, mau konfirmasi kalau laptop dengan identitas berikut",
    "",
    `Nama: ${order.customerName.trim()}`,
    `No Tlp: ${order.customerPhone.trim()}`,
    `Merk & Type Laptop: ${formatLaptopLabel(order.laptopBrand, order.laptopModel)}`,
    `Tanggal Masuk: ${formatIntakeDateId(order.createdAt)}`,
    `Jenis Service: ${serviceTypeAdminLabel(order.serviceType)}`,
    "Perbaikan/Upgrade: ",
    "TELAH SELESAI dengan total biaya sebagai berikut:",
    "",
    `Biaya perbaikan: ${repairCostLabel}`,
    "DP/diskon: -",
    `Total yang harus dibayarkan: ${totalDueLabel}`,
    "",
    "Mohon segera diambil hari ini max pukul 16.00 WIB. Jika tidak bisa hari ini maka laptop bisa di gosend atau dikirim oleh Tim Ri Group dengan ongkir sesuai jarak.",
    "",
    "Jika laptop tidak diambil lebih dari 1x24 Jam maka laptop akan dikenakan biaya inap sebesar 1k/hari dengan syarat Ri Group tidak bertanggung jawab atas kehilangan, kerusakan yang berbeda, bencana alam atau hal buruk yang melibatkan laptop pemilik. Terima kasih",
    "",
    "Regards,",
    "Ri Group Computer",
  ].join("\n");
}
