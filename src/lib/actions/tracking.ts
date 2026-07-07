"use server";

export {
  type PublicOrderTimeline,
  type PublicOrderView,
} from "@/src/lib/sdk/orders";

import {
  orderSdk,
  type PublicOrderView,
} from "@/src/lib/sdk/orders";

export async function lookupOrderByTrackingId(
  trackingId: string,
): Promise<PublicOrderView | null> {
  return orderSdk.lookupOrderByTrackingId(trackingId);
}

export async function lookupOrdersByPhone(
  phoneRaw: string,
): Promise<PublicOrderView[]> {
  return orderSdk.lookupOrdersByPhone(phoneRaw);
}
