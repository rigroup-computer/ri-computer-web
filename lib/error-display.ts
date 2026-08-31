export function looksLikeDatabaseUnreachable(message: string): boolean {
  return (
    /can't reach database|reach database server|P1001|connection refused|ECONNREFUSED|neon\.tech|timed out|ETIMEDOUT/i.test(
      message,
    )
  );
}

export function publicErrorTitle(message: string): string {
  return looksLikeDatabaseUnreachable(message)
    ? "Layanan sementara tidak tersedia"
    : "Ada masalah memuat halaman";
}

export function publicErrorDescription(message: string): string {
  if (looksLikeDatabaseUnreachable(message)) {
    return "Server tidak dapat terhubung ke database. Silakan coba lagi beberapa saat.";
  }
  return message;
}

export function adminErrorTitle(message: string): string {
  return looksLikeDatabaseUnreachable(message)
    ? "Tidak terhubung ke database"
    : "Ada masalah memuat halaman";
}
