-- AlterTable
ALTER TABLE "Bug" ADD COLUMN     "fixNotes" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "resolvedById" TEXT;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
