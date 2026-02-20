import { prisma } from "../../prisma"; // adjust if your prisma import path differs

// 1️⃣ Create Execution
export const createExecutionService = async (
  testCaseId: string,
  userId: string
) => {
  if (!testCaseId) {
    throw new Error("Test case ID is required");
  }

  // Fetch test case with steps
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    include: {
      steps: true, // ensure your TestCase model has steps relation
    },
  });

  if (!testCase) {
    throw new Error("Test case not found");
  }

  // Create execution and copy steps
  const execution = await prisma.execution.create({
    data: {
      testCaseId,
      executedById: userId,
      steps: {
        create: testCase.steps.map((step) => ({
          stepNumber: step.stepNumber,
          action: step.action,
          expectedResult: step.expectedResult,
        })),
      },
    },
    include: {
      steps: true,
    },
  });

  return execution;
};

// 2️⃣ Update Execution (Step status + actual result)
export const updateExecutionService = async (
  executionId: string,
  steps: {
    id: string;
    status?: string;
    actualResult?: string;
    notes?: string;
  }[]
) => {
  if (!executionId) {
    throw new Error("Execution ID is required");
  }

  for (const step of steps) {
  const updateData: any = {};

  if (step.status && step.status !== "") {
  updateData.status = step.status;
}

  if (step.actualResult !== undefined) {
    updateData.actualResult = step.actualResult;
  }

  if (step.notes !== undefined) {
    updateData.notes = step.notes;
  }

  await prisma.executionStep.update({
    where: { id: step.id },
    data: updateData,
  });
}

  const updatedExecution = await prisma.execution.findUnique({
    where: { id: executionId },
    include: { steps: true },
  });

  return updatedExecution;
};

// 3️⃣ Complete Execution
export const completeExecutionService = async (executionId: string) => {
  const execution = await prisma.execution.findUnique({
    where: { id: executionId },
    include: { steps: true },
  });

  if (!execution) {
    throw new Error("Execution not found");
  }

  // Calculate overall result
  let overallResult: any = "PASS";

  if (execution.steps.some((step) => step.status === "FAIL")) {
    overallResult = "FAIL";
  } else if (execution.steps.some((step) => step.status === "BLOCKED")) {
    overallResult = "BLOCKED";
  }

  const completedExecution = await prisma.execution.update({
    where: { id: executionId },
    data: {
      status: "COMPLETED",
      overallResult,
      completedAt: new Date(),
    },
    include: { steps: true },
  });

  // After marking execution completed

// Find related TestRunTestCase
const testRunCases = await prisma.testRunTestCase.findMany({
  where: {
    testCaseId: execution.testCaseId,
  },
});

// Mark them as COMPLETED
for (const trc of testRunCases) {
  await prisma.testRunTestCase.update({
    where: { id: trc.id },
    data: { status: "COMPLETED" },
  });
}

// Check if TestRun should be completed
for (const trc of testRunCases) {
  const runCases = await prisma.testRunTestCase.findMany({
    where: { testRunId: trc.testRunId },
  });

  const allCompleted = runCases.every(
    (rc) => rc.status === "COMPLETED"
  );

  if (allCompleted) {
    await prisma.testRun.update({
      where: { id: trc.testRunId },
      data: { status: "COMPLETED" },
    });
  }
}

  return completedExecution;
};


