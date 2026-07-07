import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/geocode/nominatim", () => ({
  searchNominatimAddresses: vi.fn(),
  reverseNominatimAddress: vi.fn(),
}));

import {
  reverseNominatimAddress,
  searchNominatimAddresses,
} from "@/lib/geocode/nominatim";
import { geoSdk } from "@/src/lib/sdk/geo";

describe("geoSdk.reverseGeocode", () => {
  it("returns address on success", async () => {
    vi.mocked(reverseNominatimAddress).mockResolvedValue("Jl. Test No. 1");

    const result = await geoSdk.reverseGeocode(-6.2, 106.8);
    expect(result).toEqual({ address: "Jl. Test No. 1" });
  });

  it("returns error object instead of throwing on failure", async () => {
    vi.mocked(reverseNominatimAddress).mockRejectedValue(
      new Error("network fail"),
    );

    const result = await geoSdk.reverseGeocode(-6.2, 106.8);
    expect(result).toHaveProperty("error");
    if ("error" in result) {
      expect(result.error).toBeTruthy();
    }
  });
});

describe("geoSdk.searchAddresses", () => {
  it("delegates to nominatim search", async () => {
    vi.mocked(searchNominatimAddresses).mockResolvedValue([
      { label: "Jakarta", lat: -6.2, lng: 106.8 },
    ]);

    const results = await geoSdk.searchAddresses("jakarta");
    expect(results).toHaveLength(1);
    expect(searchNominatimAddresses).toHaveBeenCalledWith("jakarta");
  });
});
