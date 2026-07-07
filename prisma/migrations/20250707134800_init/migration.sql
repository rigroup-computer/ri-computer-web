-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('REGULAR', 'DELIVERY', 'HOME_SERVICE');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('RECEIVED', 'REPAIRING', 'READY', 'COMPLETED');

-- CreateEnum
CREATE TYPE "VisitScheduleStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'DECLINED');

-- CreateTable
CREATE TABLE "ServiceOrder" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "laptopBrand" TEXT,
    "laptopModel" TEXT,
    "issue" TEXT NOT NULL,
    "issueAttachmentUrls" JSONB,
    "visitAddress" TEXT NOT NULL DEFAULT '',
    "preferredVisitAt" TIMESTAMP(3),
    "confirmedVisitAt" TIMESTAMP(3),
    "visitScheduleStatus" "VisitScheduleStatus" NOT NULL DEFAULT 'REQUESTED',
    "visitScheduleNote" TEXT,
    "serviceType" "ServiceType" NOT NULL DEFAULT 'HOME_SERVICE',
    "status" "ServiceStatus" NOT NULL DEFAULT 'RECEIVED',
    "costConfirmationNote" TEXT,
    "costLineItems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTimeline" (
    "id" TEXT NOT NULL,
    "serviceOrderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "specs" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isConsignment" BOOLEAN NOT NULL DEFAULT false,
    "ownerContact" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOrder_trackingId_key" ON "ServiceOrder"("trackingId");

-- AddForeignKey
ALTER TABLE "ServiceTimeline" ADD CONSTRAINT "ServiceTimeline_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

