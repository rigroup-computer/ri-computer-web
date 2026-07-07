import { formatVisitDateTimeId } from "@/lib/store-hours";

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

export function buildVisitConfirmationWhatsAppMessage(
  customerName: string,
  trackingId: string,
  confirmedVisitAt: Date,
  note?: string | null,
): string {
  const greeting = getIndonesianDaypartGreeting();
  const scheduleLabel = formatVisitDateTimeId(confirmedVisitAt);

  const lines = [
    `Selamat ${greeting} ${customerName.trim()}, kami dari Ri Computer mengonfirmasi jadwal kunjungan/servis Anda.`,
    "",
    `Nomor service: ${trackingId}`,
    `Jadwal dikonfirmasi: ${scheduleLabel} WIB`,
    "",
    "Mohon datang sesuai jadwal di atas. Jika ada perubahan, balas pesan ini ya ka.",
  ];

  if (note?.trim()) {
    lines.push("", "Catatan admin:", note.trim());
  }

  return lines.join("\n");
}

export function buildVisitRescheduleWhatsAppMessage(
  customerName: string,
  trackingId: string,
  confirmedVisitAt: Date,
  note?: string | null,
): string {
  const greeting = getIndonesianDaypartGreeting();
  const scheduleLabel = formatVisitDateTimeId(confirmedVisitAt);

  const lines = [
    `Selamat ${greeting} ${customerName.trim()}, kami dari Ri Computer ingin mengajukan jadwal alternatif untuk servis Anda.`,
    "",
    `Nomor service: ${trackingId}`,
    `Jadwal usulan: ${scheduleLabel} WIB`,
    "",
    "Mohon konfirmasi apakah jadwal ini cocok. Balas pesan ini ya ka.",
  ];

  if (note?.trim()) {
    lines.push("", "Catatan admin:", note.trim());
  }

  return lines.join("\n");
}

export function buildVisitDeclineWhatsAppMessage(
  customerName: string,
  trackingId: string,
  note?: string | null,
): string {
  const greeting = getIndonesianDaypartGreeting();

  const lines = [
    `Selamat ${greeting} ${customerName.trim()}, kami dari Ri Computer perlu meninjau ulang jadwal kunjungan servis Anda.`,
    "",
    `Nomor service: ${trackingId}`,
    "",
    "Preferensi jadwal yang Anda ajukan belum bisa kami terapkan saat ini. Tim Ri Computer akan segera menghubungi Anda untuk mengusulkan jadwal alternatif.",
    "",
    "Mohon tunggu pesan dari kami ya ka.",
  ];

  if (note?.trim()) {
    lines.push("", "Catatan admin:", note.trim());
  }

  return lines.join("\n");
}
