// File: apps/api/src/modules/test-run/testRun.service.ts
import { prisma } from '../../prisma';

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

export const getAllTestRunsService = async (projectId: string) => {
  return prisma.testRun.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    include: {
      testCases: { include: { testCase: true } },
      createdBy: true,
    },
  });
};

export const getTestRunByIdService = async (projectId: string, id: string) => {
  return prisma.testRun.findFirst({
    where: { id, projectId },
    include: {
      testCases: { include: { testCase: true } },
      createdBy: true,
    },
  });
};

// ✅ Added: soft cascade delete — removes junction rows first, then the run
export const deleteTestRunService = async (projectId: string, id: string) => {
  const run = await prisma.testRun.findFirst({ where: { id, projectId } });
  if (!run) return null;

  return prisma.$transaction(async (tx) => {
    // Delete junction rows first to avoid FK constraint errors
    await tx.testRunTestCase.deleteMany({ where: { testRunId: id } });
    // Delete any executions linked to this run
    await tx.execution.deleteMany({ where: { testRunId: id } }).catch(() => {});
    return tx.testRun.delete({ where: { id } });
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
