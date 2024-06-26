/*
  Warnings:

  - You are about to drop the column `error_information` on the `additionalSensorInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "additionalSensorInfo" DROP COLUMN "error_information";

-- CreateTable
CREATE TABLE "sensorErrorsLog" (
    "id" SERIAL NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "error_information" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensorErrorsLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sensorErrorsLog" ADD CONSTRAINT "sensorErrorsLog_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "new_Sensor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
