-- CreateEnum
CREATE TYPE "Role" AS ENUM ('customer', 'dispatcher', 'admin', 'supervisor');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('RESET', 'COMPLETED', 'NOT_COMPLETED');

-- CreateEnum
CREATE TYPE "ObjectsType" AS ENUM ('tower', 'bridge', 'building', 'footbridge', 'overpass');

-- CreateEnum
CREATE TYPE "ObjectsMaterial" AS ENUM ('steel', 'ferroconcrete', 'wood', 'mixed');

-- CreateTable
CREATE TABLE "appVisit" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "appVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "m_User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "organization_id" TEXT NOT NULL,
    "registration_status" "RegistrationStatus" NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "m_User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "m_AdditionalUserInfo" (
    "user_id" TEXT NOT NULL,
    "firstName" TEXT,
    "surName" TEXT,
    "phone" TEXT,
    "telegram" TEXT,
    "position" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "m_AdditionalUserInfo_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "m_Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inn" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "directorName" TEXT NOT NULL,
    "organizationPhone" TEXT NOT NULL,
    "organizationEmail" TEXT NOT NULL,

    CONSTRAINT "m_Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "m_Object" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "objectsType" "ObjectsType" NOT NULL,
    "objectsMaterial" "ObjectsMaterial" NOT NULL,
    "geo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notation" TEXT NOT NULL,

    CONSTRAINT "m_Object_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "new_Sensor" (
    "id" TEXT NOT NULL,
    "object_id" TEXT NOT NULL,
    "sensor_type" TEXT NOT NULL,
    "sensor_key" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "ip_address" TEXT,
    "designation" TEXT,
    "network_number" INTEGER NOT NULL,
    "notation" TEXT,

    CONSTRAINT "new_Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additionalSensorInfo" (
    "id" SERIAL NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "factory_number" TEXT NOT NULL,
    "unit_of_measurement" TEXT,
    "installation_location" TEXT,
    "coefficient" INTEGER,
    "base_value" INTEGER,
    "last_value" INTEGER,
    "error_information" TEXT,
    "additionalSensorInfoNotation" TEXT,

    CONSTRAINT "additionalSensorInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensorOperationLog" (
    "id" SERIAL NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "passport_information" TEXT,
    "verification_information" TEXT,
    "warranty_Information" TEXT,
    "sensorOperationLogNotation" TEXT,

    CONSTRAINT "sensorOperationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorFile" (
    "id" SERIAL NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "SensorFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type_Sensor" (
    "id" TEXT NOT NULL,
    "sensor_key" TEXT NOT NULL,
    "sensor_type" TEXT NOT NULL,
    "models" TEXT[],

    CONSTRAINT "type_Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "m_User_email_key" ON "m_User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "type_Sensor_sensor_key_key" ON "type_Sensor"("sensor_key");

-- AddForeignKey
ALTER TABLE "appVisit" ADD CONSTRAINT "appVisit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "m_User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_User" ADD CONSTRAINT "m_User_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "m_Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_AdditionalUserInfo" ADD CONSTRAINT "m_AdditionalUserInfo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "m_User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_Object" ADD CONSTRAINT "m_Object_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "m_Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "new_Sensor" ADD CONSTRAINT "new_Sensor_object_id_fkey" FOREIGN KEY ("object_id") REFERENCES "m_Object"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additionalSensorInfo" ADD CONSTRAINT "additionalSensorInfo_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "new_Sensor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensorOperationLog" ADD CONSTRAINT "sensorOperationLog_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "new_Sensor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorFile" ADD CONSTRAINT "SensorFile_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "new_Sensor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
