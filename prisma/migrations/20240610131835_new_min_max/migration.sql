/*
  Warnings:

  - You are about to drop the column `maxBase` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `minBase` on the `requestSensorInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "requestSensorInfo" DROP COLUMN "maxBase",
DROP COLUMN "minBase",
ADD COLUMN     "max_base" DOUBLE PRECISION,
ADD COLUMN     "min_base" DOUBLE PRECISION;
