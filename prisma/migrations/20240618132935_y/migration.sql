-- AlterTable
ALTER TABLE "additionalSensorInfo" ADD COLUMN     "emissionsQuantity" INTEGER DEFAULT 1,
ADD COLUMN     "errorsQuantity" INTEGER DEFAULT 1,
ADD COLUMN     "limitValue" DOUBLE PRECISION DEFAULT 0;
