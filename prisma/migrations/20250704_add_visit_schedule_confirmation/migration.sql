-- CreateEnum
CREATE TYPE "VisitScheduleStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'DECLINED');

-- AlterTable
ALTER TABLE "ServiceOrder"
ADD COLUMN "confirmedVisitAt" TIMESTAMP(3),
ADD COLUMN "visitScheduleStatus" "VisitScheduleStatus" NOT NULL DEFAULT 'REQUESTED',
ADD COLUMN "visitScheduleNote" TEXT;
