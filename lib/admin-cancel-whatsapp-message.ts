import type { ServiceType } from "@prisma/client";

function bookingSiteHostname(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return "rigroup-computer.com";
  }
  return raw.replace(/^https?:\/\//u, "").replace(/\/$/u, "");
}

export function buildNoShowCancelWhatsAppMessage(
  customerName: string,
  serviceType: ServiceType,
): string {
  const site = bookingSiteHostname();
  const name = customerName.trim();

  if (serviceType === "DELIVERY") {
    return [
      `Halo ka ${name},`,
      "",
      "mohon maaf dengan berat hati antrian kaka otomatis tercancel karena Waktu delivery hanya jam 9. Fee booking Rp.10,000 yang telah ditransfer ke rek rigroup kami anggap hangus.",
      "",
      `Jika ingin booking kembali, bisa mengajukan booking melalui web ${site} ya ka. Terima kasih banyak`,
    ].join("\n");
  }

  return [
    `Halo ka ${name}, mohon maaf dengan berat hati antrian kaka otomatis tercancel karena tidak datang sampai jam operasional store berakhir.`,
    "Fee booking Rp.10,000 yang telah ditransfer ke rek rigroup kami anggap hangus.",
    `Jika ingin booking kembali, bisa mengajukan booking melalui web ${site} ya ka.`,
    "Terima kasih banyak",
  ].join(" ");
}
