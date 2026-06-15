import type { ServiceOrderCostLineItem } from "@/lib/service-order-cost-items";

function getIndonesianDaypartGreeting(now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }).format(now),
  );

  if (hour >= 5 && hour < 11) return "Pagi";
  if (hour >= 11 && hour < 15) return "Siang";
  if (hour >= 15 && hour < 19) return "Sore";
  return "Malam";
}

export function buildCostConfirmationWhatsAppMessage(
  customerName: string,
  trackingId: string,
  lineItems: readonly ServiceOrderCostLineItem[],
  technicalNote?: string | null,
): string {
  const greeting = getIndonesianDaypartGreeting();
  const partLines = lineItems.map((item) => {
    const formattedPrice = item.price.toLocaleString("id-ID");
    return `* ${item.name} — Rp ${formattedPrice}`;
  });

  const lines = [
    `Selamat ${greeting} ${customerName.trim()}, Kami dari RI Computer ingin mengkonfirmasi unit yang sedang di service`,
    "",
    `Nomor service : ${trackingId}`,
    "Status service : Konfirmasi",
    "",
    "Part yang perlu di ganti / di beli:",
    ...partLines,
  ];

  if (technicalNote?.trim()) {
    lines.push("", "Catatan biaya tambahan:", technicalNote.trim());
  }

  return lines.join("\n");
}
