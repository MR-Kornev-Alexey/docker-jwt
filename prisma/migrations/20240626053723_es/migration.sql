/*
  Warnings:

  - You are about to drop the column `missed_consecutive` on the `requestSensorInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "additionalSensorInfo" ADD COLUMN     "missedConsecutive" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "requestSensorInfo" DROP COLUMN "missed_consecutive";
