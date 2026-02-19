import { prisma } from "../../prisma";

export const createTestRunService = async (
  name: string,
  description: string | undefined,
  startDate: Date,
  endDate: Date,
  testCaseIds: string[],
  createdById: string
) => {
  return await prisma.$transaction(async (tx) => {
    const testRun = await tx.testRun.create({
  data: {
    name,
    description: description ?? null,
    startDate,
    endDate,
    createdById,
  },
});


    const testRunCases = testCaseIds.map((testCaseId) => ({
      testRunId: testRun.id,
      testCaseId,
    }));

    await tx.testRunTestCase.createMany({
      data: testRunCases,
    });

    return testRun;
  });
};

export const getAllTestRunsService = async () => {
  return prisma.testRun.findMany({
    include: {
      testCases: {
        include: {
          testCase: true,
          assignedTo: true,
        },
      },
      createdBy: true,
    },
  });
};

export const assignTestRunCaseService = async (
  testRunTestCaseId: string,
  assignedToId: string
) => {
  return prisma.testRunTestCase.update({
    where: { id: testRunTestCaseId },
    data: {
      assignedToId,
    },
  });
};

