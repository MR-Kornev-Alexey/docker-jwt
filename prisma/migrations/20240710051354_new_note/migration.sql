-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "m_ObjectId" TEXT;

-- CreateTable
CREATE TABLE "m_notifications" (
    "id" SERIAL NOT NULL,
    "object_id" TEXT NOT NULL,
    "information" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "m_notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_m_ObjectId_fkey" FOREIGN KEY ("m_ObjectId") REFERENCES "m_Object"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_notifications" ADD CONSTRAINT "m_notifications_object_id_fkey" FOREIGN KEY ("object_id") REFERENCES "m_Object"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
