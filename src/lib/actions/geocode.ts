"use server";

import { geoSdk } from "@/src/lib/sdk/geo";

export async function searchAddresses(
  query: string,
): Promise<AddressSuggestion[]> {
  try {
    return await geoSdk.searchAddresses(query);
  } catch {
    return [];
  }
}

export async function reverseGeocodeAddress(
  lat: number,
  lng: number,
): Promise<{ address: string } | { error: string }> {
  return geoSdk.reverseGeocode(lat, lng);
}
