-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "description" TEXT,
ADD COLUMN "starred" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "dueDate" TIMESTAMP(3),
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Todo_userId_sortOrder_idx" ON "Todo"("userId", "sortOrder");

-- CreateIndex
CREATE INDEX "Todo_userId_isCompleted_idx" ON "Todo"("userId", "isCompleted");

-- CreateIndex
CREATE INDEX "Todo_userId_dueDate_idx" ON "Todo"("userId", "dueDate");
