/*
  Warnings:

  - You are about to drop the column `base_value` on the `additionalSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `last_value` on the `additionalSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `add_zero` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `base_value` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `last_value` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `logical_zero` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `max` on the `requestSensorInfo` table. All the data in the column will be lost.
  - You are about to drop the column `min` on the `requestSensorInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "additionalSensorInfo" DROP COLUMN "base_value",
DROP COLUMN "last_value",
ALTER COLUMN "coefficient" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "requestSensorInfo" DROP COLUMN "add_zero",
DROP COLUMN "base_value",
DROP COLUMN "last_value",
DROP COLUMN "logical_zero",
DROP COLUMN "max",
DROP COLUMN "min",
ADD COLUMN     "base_zero" DOUBLE PRECISION,
ADD COLUMN     "last_base_value" DOUBLE PRECISION,
ADD COLUMN     "last_valueX" DOUBLE PRECISION,
ADD COLUMN     "last_valueY" DOUBLE PRECISION,
ADD COLUMN     "last_valueZ" DOUBLE PRECISION,
ADD COLUMN     "maxBase" DOUBLE PRECISION,
ADD COLUMN     "maxX" DOUBLE PRECISION,
ADD COLUMN     "maxY" DOUBLE PRECISION,
ADD COLUMN     "maxZ" DOUBLE PRECISION,
ADD COLUMN     "minBase" DOUBLE PRECISION,
ADD COLUMN     "minX" DOUBLE PRECISION,
ADD COLUMN     "minY" DOUBLE PRECISION,
ADD COLUMN     "minZ" DOUBLE PRECISION,
ADD COLUMN     "zeroX" DOUBLE PRECISION,
ADD COLUMN     "zeroY" DOUBLE PRECISION,
ADD COLUMN     "zeroZ" DOUBLE PRECISION;
