/*
  Warnings:

  - You are about to drop the `_TestCaseToTestSuite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TestCaseToTestSuite" DROP CONSTRAINT "_TestCaseToTestSuite_A_fkey";

-- DropForeignKey
ALTER TABLE "_TestCaseToTestSuite" DROP CONSTRAINT "_TestCaseToTestSuite_B_fkey";

-- AlterTable
ALTER TABLE "TestSuite" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "_TestCaseToTestSuite";

-- CreateTable
CREATE TABLE "TestSuiteTestCase" (
    "id" TEXT NOT NULL,
    "suiteId" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestSuiteTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestSuiteTestCase_suiteId_testCaseId_key" ON "TestSuiteTestCase"("suiteId", "testCaseId");

-- AddForeignKey
ALTER TABLE "TestSuiteTestCase" ADD CONSTRAINT "TestSuiteTestCase_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "TestSuite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSuiteTestCase" ADD CONSTRAINT "TestSuiteTestCase_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
