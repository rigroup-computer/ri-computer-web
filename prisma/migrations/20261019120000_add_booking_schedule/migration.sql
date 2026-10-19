-- CreateTable
CREATE TABLE "ScheduleWeeklyRule" (
    "id" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "weekday" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "slots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleWeeklyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleDateOverride" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "isOpen" BOOLEAN NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "slots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleDateOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleWeeklyRule_serviceType_weekday_key" ON "ScheduleWeeklyRule"("serviceType", "weekday");

-- CreateIndex
CREATE INDEX "ScheduleDateOverride_date_idx" ON "ScheduleDateOverride"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleDateOverride_date_serviceType_key" ON "ScheduleDateOverride"("date", "serviceType");

-- Seed current Jaya Plaza schedule (mirrors lib/schedule-defaults.ts)
INSERT INTO "ScheduleWeeklyRule" ("id", "serviceType", "weekday", "isOpen", "openTime", "closeTime", "slots", "updatedAt") VALUES
  ('sched_regular_0',  'REGULAR',  0, false, '09:30', '16:00', ARRAY[]::TEXT[], CURRENT_TIMESTAMP),
  ('sched_regular_1',  'REGULAR',  1, true,  '09:30', '16:00', ARRAY['10:00','11:00','12:00','13:00','14:00','15:00'], CURRENT_TIMESTAMP),
  ('sched_regular_2',  'REGULAR',  2, true,  '09:30', '16:00', ARRAY['10:00','11:00','12:00','13:00','14:00','15:00'], CURRENT_TIMESTAMP),
  ('sched_regular_3',  'REGULAR',  3, true,  '09:30', '16:00', ARRAY['10:00','11:00','12:00','13:00','14:00','15:00'], CURRENT_TIMESTAMP),
  ('sched_regular_4',  'REGULAR',  4, true,  '09:30', '16:00', ARRAY['10:00','11:00','12:00','13:00','14:00','15:00'], CURRENT_TIMESTAMP),
  ('sched_regular_5',  'REGULAR',  5, false, '09:30', '16:00', ARRAY[]::TEXT[], CURRENT_TIMESTAMP),
  ('sched_regular_6',  'REGULAR',  6, true,  '09:30', '16:30', ARRAY['10:00','11:00','12:00','13:00','14:00'], CURRENT_TIMESTAMP),
  ('sched_delivery_0', 'DELIVERY', 0, false, '09:30', '16:00', ARRAY[]::TEXT[], CURRENT_TIMESTAMP),
  ('sched_delivery_1', 'DELIVERY', 1, true,  '09:30', '16:00', ARRAY['10:00','11:00','12:00','13:00','14:00','15:00'], CURRENT_TIMESTAMP),
  ('sched_delivery_2', 'DELIVERY', 2, true,  '09:30', '16:00', ARRAY['09:00'], CURRENT_TIMESTAMP),
  ('sched_delivery_3', 'DELIVERY', 3, true,  '09:30', '16:00', ARRAY['09:00'], CURRENT_TIMESTAMP),
  ('sched_delivery_4', 'DELIVERY', 4, true,  '09:30', '16:00', ARRAY['09:00'], CURRENT_TIMESTAMP),
  ('sched_delivery_5', 'DELIVERY', 5, false, '09:30', '16:00', ARRAY[]::TEXT[], CURRENT_TIMESTAMP),
  ('sched_delivery_6', 'DELIVERY', 6, true,  '09:30', '16:30', ARRAY['10:00','11:00','12:00','13:00','14:00'], CURRENT_TIMESTAMP)
ON CONFLICT ("serviceType", "weekday") DO NOTHING;
