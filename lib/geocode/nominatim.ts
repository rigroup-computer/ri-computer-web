const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const MIN_INTERVAL_MS = 1000;

let lastNominatimRequestAt = 0;

export type AddressSuggestion = {
  displayName: string;
  lat: number;
  lng: number;
};

type NominatimSearchResult = {
  display_name?: string;
  lat?: string;
  lon?: string;
};

type NominatimReverseResult = {
  display_name?: string;
};

function nominatimUserAgent(): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return `RiComputer-Booking/1.0 (${siteUrl})`;
}

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const wait = MIN_INTERVAL_MS - (now - lastNominatimRequestAt);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastNominatimRequestAt = Date.now();
}

async function nominatimFetch(path: string): Promise<Response> {
  await waitForRateLimit();
  return fetch(`${NOMINATIM_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": nominatimUserAgent(),
    },
    next: { revalidate: 300 },
  });
}

function parseSuggestion(item: NominatimSearchResult): AddressSuggestion | null {
  const displayName = item.display_name?.trim();
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  if (!displayName || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return { displayName, lat, lng };
}

export async function searchNominatimAddresses(
  query: string,
): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (q.length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    q,
    format: "json",
    addressdetails: "1",
    limit: "5",
    countrycodes: "id",
  });

  const response = await nominatimFetch(`/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Gagal mencari alamat.");
  }

  const data = (await response.json()) as NominatimSearchResult[];
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(parseSuggestion)
    .filter((item): item is AddressSuggestion => item !== null);
}

export async function reverseNominatimAddress(
  lat: number,
  lng: number,
): Promise<string> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Koordinat tidak valid.");
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    addressdetails: "1",
  });

  const response = await nominatimFetch(`/reverse?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Gagal mengonversi lokasi ke alamat.");
  }

  const data = (await response.json()) as NominatimReverseResult;
  const displayName = data.display_name?.trim();
  if (!displayName) {
    throw new Error("Alamat tidak ditemukan untuk lokasi ini.");
  }

  return displayName;
}
