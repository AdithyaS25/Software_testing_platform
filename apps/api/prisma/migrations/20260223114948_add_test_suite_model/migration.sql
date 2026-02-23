-- CreateTable
CREATE TABLE "TestSuite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestSuite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TestCaseToTestSuite" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TestCaseToTestSuite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TestCaseToTestSuite_B_index" ON "_TestCaseToTestSuite"("B");

-- AddForeignKey
ALTER TABLE "TestSuite" ADD CONSTRAINT "TestSuite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TestCaseToTestSuite" ADD CONSTRAINT "_TestCaseToTestSuite_A_fkey" FOREIGN KEY ("A") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TestCaseToTestSuite" ADD CONSTRAINT "_TestCaseToTestSuite_B_fkey" FOREIGN KEY ("B") REFERENCES "TestSuite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
