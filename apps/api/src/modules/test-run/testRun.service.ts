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
  const runs = await prisma.testRun.findMany({
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

  return runs.map((run) => {
    const total = run.testCases.length;
    const completed = run.testCases.filter(
      (tc) => tc.status === "COMPLETED"
    ).length;

    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      ...run,
      progress,
    };
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

export const getTestRunByIdService = async (id: string) => {
  const run = await prisma.testRun.findUnique({
    where: { id },
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

  if (!run) return null;

  const total = run.testCases.length;
  const completed = run.testCases.filter(
    (tc) => tc.status === "COMPLETED"
  ).length;

  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    ...run,
    progress,
  };
};

