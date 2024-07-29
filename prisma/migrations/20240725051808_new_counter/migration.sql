-- AlterTable
ALTER TABLE "requestSensorInfo" ADD COLUMN     "over_counter" INTEGER DEFAULT 0,
ADD COLUMN     "under_counter" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "commonErrorsLog" (
    "id" SERIAL NOT NULL,
    "counter_error" INTEGER DEFAULT 0,
    "error_information" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commonErrorsLog_pkey" PRIMARY KEY ("id")
);
