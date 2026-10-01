-- AlterTable
ALTER TABLE "donations" DROP COLUMN "slipUrl";

-- CreateIndex
CREATE UNIQUE INDEX "donations_slipStorageKey_key" ON "donations"("slipStorageKey");

