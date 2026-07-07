/**
 * Address search and reverse geocoding via OpenStreetMap Nominatim.
 */
import {
  reverseNominatimAddress,
  searchNominatimAddresses,
  type AddressSuggestion,
} from "@/lib/geocode/nominatim";
import { nominatimClient } from "./base";

const MAX_ADDRESS_LENGTH = 500;

export type { AddressSuggestion };

/** Success with truncated address, or failure message (does not throw). */
export type ReverseGeocodeResult =
  | Readonly<{ address: string }>
  | Readonly<{ error: string }>;

function truncateAddress(address: string): string {
  return address.slice(0, MAX_ADDRESS_LENGTH);
}

/** Geocoding for the booking form address picker. */
export const geoSdk = {
  /** @throws {SdkError} when Nominatim search fails. */
  async searchAddresses(query: string): Promise<AddressSuggestion[]> {
    return nominatimClient.execute(
      "searchAddresses",
      () => searchNominatimAddresses(query),
      { message: "Gagal mencari alamat." },
    );
  },

  /**
   * Resolve coordinates to a display address (max 500 characters).
   * @returns `{ address }` on success or `{ error }` on failure — never throws.
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    try {
      const address = await nominatimClient.execute(
        "reverseGeocode",
        () => reverseNominatimAddress(lat, lng),
        { message: "Gagal mengonversi lokasi ke alamat." },
      );
      return { address: truncateAddress(address) };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal mengonversi lokasi ke alamat.";
      return { error: message };
    }
  },
} as const;
