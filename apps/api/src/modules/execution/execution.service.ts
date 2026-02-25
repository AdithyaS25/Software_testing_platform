import { prisma } from "../../prisma"; // adjust if your prisma import path differs
import { ExecutionStatus, StepStatus } from "@prisma/client";


// 1️⃣ Create Execution
export const createExecutionService = async (
  testCaseId: string,
  testRunId: string,
  userId: string
) => {
  if (!testCaseId) {
    throw new Error("Test case ID is required");
  }

  if (!testRunId) {
    throw new Error("Test run ID is required");
  }

  // Validate test case
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    include: { steps: true },
  });

  if (!testCase) {
    throw new Error("Test case not found");
  }

  // Validate test run exists
  const testRun = await prisma.testRun.findUnique({
    where: { id: testRunId },
  });

  if (!testRun) {
    throw new Error("Test run not found");
  }

  // ✅ CHECK IF EXECUTION ALREADY EXISTS (IDEMPOTENT GUARD)
  const existingExecution = await prisma.execution.findFirst({
    where: {
      testCaseId,
      testRunId,
      executedById: userId,
      status: ExecutionStatus.IN_PROGRESS,
    },
    include: {
      steps: true,
    },
  });

  if (existingExecution) {
    return existingExecution;
  }

  // ✅ CREATE NEW EXECUTION
  const execution = await prisma.execution.create({
    data: {
      testCaseId,
      testRunId,
      executedById: userId,
      status: ExecutionStatus.IN_PROGRESS,
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
  payload: {
    status?: ExecutionStatus;
    steps?: {
      id: string;
      status?: "PASS" | "FAIL" | "BLOCKED" | "SKIPPED";
      actualResult?: string;
      notes?: string;
    }[];
  }
) => {
  const { status, steps } = payload;

  const execution = await prisma.execution.findUnique({
    where: { id: executionId },
  });

  if (!execution) {
    throw new Error("Execution not found");
  }

  // 🔹 Update execution status
  if (status) {
    await prisma.execution.update({
      where: { id: executionId },
      data: { status }, // ✅ Now correctly typed
    });
  }

  // 🔹 Update execution steps
  if (steps && Array.isArray(steps)) {
    for (const step of steps) {
      const updateData: any = {};

      if (step.status) updateData.status = step.status;
      if (step.actualResult)
        updateData.actualResult = step.actualResult;
      if (step.notes) updateData.notes = step.notes;

      await prisma.executionStep.update({
        where: { id: step.id },
        data: updateData,
      });
    }
  }

  return prisma.execution.findUnique({
    where: { id: executionId },
    include: { steps: true },
  });
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


