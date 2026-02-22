-- AlterTable
ALTER TABLE "Bug" ADD COLUMN     "affectedVersion" TEXT,
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "environment" TEXT,
ADD COLUMN     "stepsToReproduce" TEXT;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
