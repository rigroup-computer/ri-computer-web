const labels: Record<string, string> = {
  RECEIVED: "Laptop Antrian",
  REPAIRING: "Sedang di Service",
  READY: "Konfirmasi Biaya Tambahan",
  COMPLETED: "Selesai",
  /** Legacy — treated as Sedang di Service until migration completes. */
  CHECKING: "Sedang di Service",
};

export function serviceStatusLabel(code: string) {
  return labels[code] ?? code;
}
