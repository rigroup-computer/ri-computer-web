const labels: Record<string, string> = {
  RECEIVED: "Diterima",
  CHECKING: "Pengecekan",
  REPAIRING: "Perbaikan",
  READY: "Siap diambil / selesai dikerjakan",
  COMPLETED: "Selesai",
};

export function serviceStatusLabel(code: string) {
  return labels[code] ?? code;
}
