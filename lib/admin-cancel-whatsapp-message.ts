function bookingSiteHostname(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return "rigroup-computer.com";
  }
  return raw.replace(/^https?:\/\//u, "").replace(/\/$/u, "");
}

export function buildNoShowCancelWhatsAppMessage(customerName: string): string {
  const site = bookingSiteHostname();

  return [
    `Halo ka ${customerName.trim()}, mohon maaf dengan berat hati antrian kaka otomatis tercancel karena tidak datang sampai jam operasional store berakhir.`,
    "Fee booking Rp.10,000 yang telah ditransfer ke rek rigroup kami anggap hangus.",
    `Jika ingin booking kembali, bisa mengajukan booking melalui web ${site} ya ka.`,
    "Terima kasih banyak",
  ].join(" ");
}
