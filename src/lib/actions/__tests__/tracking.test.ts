import { describe, expect, it, vi } from "vitest";

vi.mock("@/src/lib/sdk/orders", () => ({
  orderSdk: {
    lookupOrderByTrackingId: vi.fn(),
    lookupOrdersByPhone: vi.fn(),
  },
}));

import { orderSdk } from "@/src/lib/sdk/orders";
import {
  lookupOrderByTrackingId,
  lookupOrdersByPhone,
} from "@/src/lib/actions/tracking";

describe("tracking actions", () => {
  it("lookupOrderByTrackingId delegates to orderSdk", async () => {
    vi.mocked(orderSdk.lookupOrderByTrackingId).mockResolvedValue(null);

    await lookupOrderByTrackingId("RC-ABC");

    expect(orderSdk.lookupOrderByTrackingId).toHaveBeenCalledWith("RC-ABC");
  });

  it("lookupOrdersByPhone delegates to orderSdk", async () => {
    vi.mocked(orderSdk.lookupOrdersByPhone).mockResolvedValue([]);

    await lookupOrdersByPhone("081234567890");

    expect(orderSdk.lookupOrdersByPhone).toHaveBeenCalledWith("081234567890");
  });
});
