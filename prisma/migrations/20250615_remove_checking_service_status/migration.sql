-- Migrate legacy CHECKING rows before removing enum value.
UPDATE "ServiceOrder" SET status = 'REPAIRING' WHERE status = 'CHECKING';

-- Prisma db push removes CHECKING from ServiceStatus enum.
