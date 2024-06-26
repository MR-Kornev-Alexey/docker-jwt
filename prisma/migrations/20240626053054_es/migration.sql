/*
  Warnings:

  - You are about to alter the column `missed_consecutive` on the `requestSensorInfo` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "requestSensorInfo" ALTER COLUMN "missed_consecutive" SET DEFAULT 0,
ALTER COLUMN "missed_consecutive" SET DATA TYPE INTEGER;
