-- AlterTable
ALTER TABLE "requestSensorInfo" ADD COLUMN     "add_zero" INTEGER,
ADD COLUMN     "logical_zero" INTEGER,
ADD COLUMN     "max" INTEGER,
ADD COLUMN     "min" INTEGER,
ADD COLUMN     "warning" BOOLEAN NOT NULL DEFAULT false;
