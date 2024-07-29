/*
  Warnings:

  - You are about to drop the column `minMaxQuantity` on the `additionalSensorInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "additionalSensorInfo" DROP COLUMN "minMaxQuantity",
ADD COLUMN     "maxQuantity" INTEGER DEFAULT 0,
ADD COLUMN     "minQuantity" INTEGER DEFAULT 0;
