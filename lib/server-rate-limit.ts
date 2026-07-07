import { headers } from "next/headers";
import {
  rateLimitSdk,
  type RateLimitOptions,
  type RateLimitResult,
} from "@/src/lib/sdk/rate-limit";

export type { RateLimitOptions, RateLimitResult };

export const RATE_LIMIT_SCOPES = {
  createServiceOrder: {
    scope: "createServiceOrder",
    maxHits: 5,
    windowMs: 15 * 60 * 1000,
  },
  uploadBookingIssueImage: {
    scope: "uploadBookingIssueImage",
    maxHits: 10,
    windowMs: 15 * 60 * 1000,
  },
  searchAddresses: {
    scope: "searchAddresses",
    maxHits: 30,
    windowMs: 60 * 1000,
  },
  reverseGeocodeAddress: {
    scope: "reverseGeocodeAddress",
    maxHits: 20,
    windowMs: 60 * 1000,
  },
  adminLogin: {
    scope: "adminLogin",
    maxHits: 5,
    windowMs: 15 * 60 * 1000,
  },
} as const satisfies Record<
  string,
  RateLimitOptions & Readonly<{ scope: string }>
>;

export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");

  if (forwarded) {
    const firstHop = forwarded.split(",")[0]?.trim();
    if (firstHop) {
      return firstHop;
    }
  }

  const realIp = headerList.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export async function consumeActionRateLimit(
  config: (typeof RATE_LIMIT_SCOPES)[keyof typeof RATE_LIMIT_SCOPES],
): Promise<RateLimitResult> {
  const ip = await getClientIp();
  return rateLimitSdk.consumeRateLimit(config.scope, ip, config);
}

export async function checkActionRateLimit(
  config: (typeof RATE_LIMIT_SCOPES)[keyof typeof RATE_LIMIT_SCOPES],
): Promise<RateLimitResult> {
  const ip = await getClientIp();
  return rateLimitSdk.isRateLimited(config.scope, ip, config);
}

export async function recordActionRateLimitHit(
  config: (typeof RATE_LIMIT_SCOPES)[keyof typeof RATE_LIMIT_SCOPES],
): Promise<void> {
  const ip = await getClientIp();
  await rateLimitSdk.recordRateLimitHit(config.scope, ip, config);
}

export async function clearActionRateLimit(
  config: (typeof RATE_LIMIT_SCOPES)[keyof typeof RATE_LIMIT_SCOPES],
): Promise<void> {
  const ip = await getClientIp();
  await rateLimitSdk.clearRateLimit(config.scope, ip);
}
