-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "information" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
