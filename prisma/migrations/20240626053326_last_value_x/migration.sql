-- AlterTable
ALTER TABLE "requestSensorInfo" ADD COLUMN     "last_valueX" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "last_valueY" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "last_valueZ" DOUBLE PRECISION DEFAULT 0;
