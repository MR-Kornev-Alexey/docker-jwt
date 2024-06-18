-- AlterTable
ALTER TABLE "m_Object" ADD COLUMN     "periodicity" INTEGER NOT NULL DEFAULT 10000,
ADD COLUMN     "set_null" BOOLEAN NOT NULL DEFAULT false;
