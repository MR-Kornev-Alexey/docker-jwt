-- CreateTable
CREATE TABLE "reqestSensorInfo" (
    "id" SERIAL NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "periodicity" INTEGER NOT NULL,
    "request_code" TEXT NOT NULL,

    CONSTRAINT "reqestSensorInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataFromSensor" (
    "id" SERIAL NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "request_code" TEXT NOT NULL,
    "answer_code" TEXT NOT NULL,

    CONSTRAINT "dataFromSensor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reqestSensorInfo" ADD CONSTRAINT "reqestSensorInfo_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "new_Sensor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataFromSensor" ADD CONSTRAINT "dataFromSensor_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "new_Sensor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
