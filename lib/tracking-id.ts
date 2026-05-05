/** Tanpa I, O, 0, 1 agar mudah dibaca/dikutip */
const BODY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomBodySegment(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < length; i++) {
    s += BODY_ALPHABET[bytes[i] % BODY_ALPHABET.length];
  }
  return s;
}

function defaultPrefix(): string {
  const fromEnv = process.env.TRACKING_PUBLIC_PREFIX?.trim();
  if (fromEnv && /^[A-Za-z]{2,6}$/.test(fromEnv)) {
    return fromEnv.toUpperCase();
  }
  return "RC";
}

/** Nomor lacak untuk tampilan & pencarian publik, mis. `RC-A1B2C3D4E5` */
export function generatePublicTrackingId(): string {
  const prefix = defaultPrefix();
  return `${prefix}-${randomBodySegment(10)}`;
}

/** Samakan huruf besar untuk nomor bertipe kurir; UUID lama dibiarkan apa adanya. */
export function normalizeTrackingLookupInput(raw: string): string {
  const t = raw.trim().replace(/\s+/g, "");
  const p = defaultPrefix();
  if (
    t.length > p.length + 1 &&
    t.slice(0, p.length).toUpperCase() === p &&
    t[p.length] === "-"
  ) {
    return t.toUpperCase();
  }
  return t;
}
