/**
 * Prisma-backed sliding-window rate limits for public actions and admin login.
 */
import { prisma } from "@/lib/prisma";
import { prismaClient } from "./base";

export type RateLimitOptions = Readonly<{
  maxHits: number;
  windowMs: number;
}>;

export type RateLimitResult =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; error: string; retryAfterMs: number }>;

function windowEndsAtFromNow(windowMs: number): Date {
  return new Date(Date.now() + windowMs);
}

function rateLimitBlockedMessage(retryAfterMs: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterMs / 60_000));
  return `Terlalu banyak permintaan. Coba lagi dalam ${minutes} menit.`;
}

async function findEntry(scope: string, key: string) {
  return prisma.rateLimitEntry.findUnique({
    where: { scope_key: { scope, key } },
  });
}

export const rateLimitSdk = {
  /** Check whether the bucket is already at or over the limit (no increment). */
  async isRateLimited(
    scope: string,
    key: string,
    options: RateLimitOptions,
  ): Promise<RateLimitResult> {
    return prismaClient.execute("isRateLimited", async () => {
      const now = Date.now();
      const entry = await findEntry(scope, key);

      if (!entry || entry.windowEndsAt.getTime() <= now) {
        return { ok: true };
      }

      if (entry.hitCount >= options.maxHits) {
        return {
          ok: false,
          error: rateLimitBlockedMessage(entry.windowEndsAt.getTime() - now),
          retryAfterMs: entry.windowEndsAt.getTime() - now,
        };
      }

      return { ok: true };
    });
  },

  /** Consume one hit; blocks when the window is exhausted. */
  async consumeRateLimit(
    scope: string,
    key: string,
    options: RateLimitOptions,
  ): Promise<RateLimitResult> {
    return prismaClient.execute("consumeRateLimit", async () => {
      const now = Date.now();
      const entry = await findEntry(scope, key);

      if (!entry || entry.windowEndsAt.getTime() <= now) {
        await prisma.rateLimitEntry.upsert({
          where: { scope_key: { scope, key } },
          create: {
            scope,
            key,
            hitCount: 1,
            windowEndsAt: windowEndsAtFromNow(options.windowMs),
          },
          update: {
            hitCount: 1,
            windowEndsAt: windowEndsAtFromNow(options.windowMs),
          },
        });
        return { ok: true };
      }

      if (entry.hitCount >= options.maxHits) {
        return {
          ok: false,
          error: rateLimitBlockedMessage(entry.windowEndsAt.getTime() - now),
          retryAfterMs: entry.windowEndsAt.getTime() - now,
        };
      }

      await prisma.rateLimitEntry.update({
        where: { scope_key: { scope, key } },
        data: { hitCount: { increment: 1 } },
      });
      return { ok: true };
    });
  },

  /** Record a failed attempt (e.g. wrong admin password). */
  async recordRateLimitHit(
    scope: string,
    key: string,
    options: RateLimitOptions,
  ): Promise<void> {
    await prismaClient.execute("recordRateLimitHit", async () => {
      const now = Date.now();
      const entry = await findEntry(scope, key);

      if (!entry || entry.windowEndsAt.getTime() <= now) {
        await prisma.rateLimitEntry.upsert({
          where: { scope_key: { scope, key } },
          create: {
            scope,
            key,
            hitCount: 1,
            windowEndsAt: windowEndsAtFromNow(options.windowMs),
          },
          update: {
            hitCount: 1,
            windowEndsAt: windowEndsAtFromNow(options.windowMs),
          },
        });
        return;
      }

      await prisma.rateLimitEntry.update({
        where: { scope_key: { scope, key } },
        data: { hitCount: { increment: 1 } },
      });
    });
  },

  async clearRateLimit(scope: string, key: string): Promise<void> {
    await prismaClient.execute("clearRateLimit", async () => {
      await prisma.rateLimitEntry.deleteMany({
        where: { scope, key },
      });
    });
  },
} as const;
