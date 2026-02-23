-- CreateEnum
CREATE TYPE "SuiteExecutionMode" AS ENUM ('SEQUENTIAL', 'PARALLEL');

-- CreateEnum
CREATE TYPE "SuiteExecutionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExecutionStatus" ADD VALUE 'PASSED';
ALTER TYPE "ExecutionStatus" ADD VALUE 'FAILED';
ALTER TYPE "ExecutionStatus" ADD VALUE 'BLOCKED';
ALTER TYPE "ExecutionStatus" ADD VALUE 'SKIPPED';

-- AlterTable
ALTER TABLE "Execution" ADD COLUMN     "suiteExecutionId" TEXT;

-- CreateTable
CREATE TABLE "TestSuiteExecution" (
    "id" TEXT NOT NULL,
    "suiteId" TEXT NOT NULL,
    "executedById" TEXT NOT NULL,
    "executionMode" "SuiteExecutionMode" NOT NULL,
    "status" "SuiteExecutionStatus" NOT NULL,
    "totalTests" INTEGER NOT NULL,
    "passed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "blocked" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestSuiteExecution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_suiteExecutionId_fkey" FOREIGN KEY ("suiteExecutionId") REFERENCES "TestSuiteExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSuiteExecution" ADD CONSTRAINT "TestSuiteExecution_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "TestSuite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSuiteExecution" ADD CONSTRAINT "TestSuiteExecution_executedById_fkey" FOREIGN KEY ("executedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
