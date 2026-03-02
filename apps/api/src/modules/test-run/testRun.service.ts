import { prisma } from "../../prisma";

export const createTestRunService = async (
  projectId: string,
  name: string,
  description: string | undefined,
  startDate: Date,
  endDate: Date,
  testCaseIds: string[],
  createdById: string
) => {
  return prisma.$transaction(async (tx) => {
    const testRun = await tx.testRun.create({
      data: {
        name,
        description: description ?? null,
        startDate,
        endDate,
        createdById,
        projectId,
      },
    });

    if (testCaseIds?.length) {
      await tx.testRunTestCase.createMany({
        data: testCaseIds.map((testCaseId) => ({
          testRunId: testRun.id,
          testCaseId,
        })),
      });
    }

    return testRun;
  });
};

export const getAllTestRunsService = async (
  projectId: string
) => {
  return prisma.testRun.findMany({
    where: { projectId },
    include: {
      testCases: {
        include: { testCase: true },
      },
      createdBy: true,
    },
  });
};

export const getTestRunByIdService = async (
  projectId: string,
  id: string
) => {
  return prisma.testRun.findFirst({
    where: { id, projectId },
    include: {
      testCases: {
        include: { testCase: true },
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
    data: { assignedToId },
  });
};
