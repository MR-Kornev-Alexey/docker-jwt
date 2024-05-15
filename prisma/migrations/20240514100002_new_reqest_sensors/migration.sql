/*
  Warnings:

  - You are about to drop the `reqestSensorInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reqestSensorInfo" DROP CONSTRAINT "reqestSensorInfo_sensor_id_fkey";

-- DropTable
DROP TABLE "reqestSensorInfo";

-- CreateTable
CREATE TABLE "requestSensorInfo" (
    "id" SERIAL NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "periodicity" INTEGER NOT NULL,
    "request_code" TEXT,

    CONSTRAINT "requestSensorInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "requestSensorInfo" ADD CONSTRAINT "requestSensorInfo_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "new_Sensor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
