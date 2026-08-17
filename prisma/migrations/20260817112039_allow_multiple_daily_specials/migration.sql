-- DropIndex
DROP INDEX "DailySpecial_date_key";

-- AlterTable
ALTER TABLE "DailySpecial" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "DailySpecial_date_idx" ON "DailySpecial"("date");
