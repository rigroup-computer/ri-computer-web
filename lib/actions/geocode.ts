"use server";

import {
  reverseNominatimAddress,
  searchNominatimAddresses,
  type AddressSuggestion,
} from "@/lib/geocode/nominatim";

const MAX_ADDRESS_LENGTH = 500;

function truncateAddress(address: string): string {
  return address.slice(0, MAX_ADDRESS_LENGTH);
}

export async function searchAddresses(
  query: string,
): Promise<AddressSuggestion[]> {
  try {
    return await searchNominatimAddresses(query);
  } catch {
    return [];
  }
}

export async function reverseGeocodeAddress(
  lat: number,
  lng: number,
): Promise<{ address: string } | { error: string }> {
  try {
    const address = await reverseNominatimAddress(lat, lng);
    return { address: truncateAddress(address) };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Gagal mengonversi lokasi ke alamat.";
    return { error: message };
  }
}
