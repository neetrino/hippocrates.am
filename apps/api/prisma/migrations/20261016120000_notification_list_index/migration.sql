-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_id_idx" ON "Notification"("userId", "createdAt" DESC, "id" DESC);
