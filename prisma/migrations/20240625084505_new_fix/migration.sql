/*
  Warnings:

  - You are about to drop the column `warranty_Information` on the `sensorOperationLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sensorOperationLog" DROP COLUMN "warranty_Information",
ADD COLUMN     "warranty_information" TEXT;
