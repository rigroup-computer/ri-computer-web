-- CreateIndex
CREATE INDEX "ServiceOrder_customerPhone_idx" ON "ServiceOrder"("customerPhone");

-- CreateIndex
CREATE INDEX "ServiceOrder_status_createdAt_idx" ON "ServiceOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceOrder_serviceType_createdAt_idx" ON "ServiceOrder"("serviceType", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceOrder_updatedAt_idx" ON "ServiceOrder"("updatedAt");
