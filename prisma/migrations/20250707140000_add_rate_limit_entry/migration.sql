-- CreateTable
CREATE TABLE "RateLimitEntry" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 1,
    "windowEndsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateLimitEntry_windowEndsAt_idx" ON "RateLimitEntry"("windowEndsAt");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitEntry_scope_key_key" ON "RateLimitEntry"("scope", "key");
