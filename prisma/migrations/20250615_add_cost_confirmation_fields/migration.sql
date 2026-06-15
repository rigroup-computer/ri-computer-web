-- AlterTable
ALTER TABLE "ServiceOrder" ADD COLUMN "costConfirmationNote" TEXT,
ADD COLUMN "costLineItems" JSONB;
