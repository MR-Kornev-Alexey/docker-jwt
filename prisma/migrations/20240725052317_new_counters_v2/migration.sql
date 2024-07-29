-- AlterTable
ALTER TABLE "additionalSensorInfo" ADD COLUMN     "minMaxQuantity" INTEGER DEFAULT 0,
ALTER COLUMN "emissionsQuantity" SET DEFAULT 0,
ALTER COLUMN "errorsQuantity" SET DEFAULT 0;
