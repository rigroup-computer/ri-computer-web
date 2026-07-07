"use server";

import {
  consumeActionRateLimit,
  RATE_LIMIT_SCOPES,
} from "@/lib/server-rate-limit";
import { geoSdk, type AddressSuggestion } from "@/src/lib/sdk/geo";

export async function searchAddresses(
  query: string,
): Promise<AddressSuggestion[]> {
  const limited = await consumeActionRateLimit(RATE_LIMIT_SCOPES.searchAddresses);
  if (!limited.ok) {
    return [];
  }

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
  const limited = await consumeActionRateLimit(
    RATE_LIMIT_SCOPES.reverseGeocodeAddress,
  );
  if (!limited.ok) {
    return { error: limited.error };
  }

  return geoSdk.reverseGeocode(lat, lng);
}
