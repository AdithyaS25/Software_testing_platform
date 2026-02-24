-- AlterTable
ALTER TABLE "Execution" ADD COLUMN     "testRunId" TEXT;

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
