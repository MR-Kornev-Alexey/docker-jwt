/*
  Warnings:

  - You are about to drop the column `last_valueX` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `last_valueY` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `last_valueZ` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `maxX` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `maxY` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `maxZ` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `minX` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `minY` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `minZ` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `zeroX` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `zeroY` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `zeroZ` on the `requestSensorInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "requestSensorInfo" DROP COLUMN "last_valueX",
DROP COLUMN "last_valueY",
DROP COLUMN "last_valueZ",
DROP COLUMN "maxX",
DROP COLUMN "maxY",
DROP COLUMN "maxZ",
DROP COLUMN "minX",
DROP COLUMN "minY",
DROP COLUMN "minZ",
DROP COLUMN "zeroX",
DROP COLUMN "zeroY",
DROP COLUMN "zeroZ",
ADD COLUMN     "missed_consecutive" DOUBLE PRECISION DEFAULT 0;
