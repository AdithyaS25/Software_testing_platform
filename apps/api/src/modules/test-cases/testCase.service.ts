import { prisma } from "../../prisma";
import { CreateTestCaseInput } from "./testCase.schema";

function generateTestCaseId(sequence: number): string {
  const year = new Date().getFullYear();
  return `TC-${year}-${sequence.toString().padStart(5, "0")}`;
}

export async function createTestCase(
  data: CreateTestCaseInput,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    // Get count to generate sequential Test Case ID
    const count = await tx.testCase.count();

    const testCaseId = generateTestCaseId(count + 1);

    const testCase = await tx.testCase.create({
      data: {
        testCaseId,
        title: data.title,
        description: data.description,
        module: data.module,
        priority: data.priority,
        severity: data.severity,
        type: data.type,
        status: data.status,

        preConditions: data.preConditions ?? null,
        testDataRequirements: data.testDataRequirements ?? null,
        environmentRequirements: data.environmentRequirements ?? null,
        postConditions: data.postConditions ?? null,
        cleanupSteps: data.cleanupSteps ?? null,

        estimatedDuration: data.estimatedDuration ?? null,
        automationStatus: data.automationStatus,
        automationScriptLink: data.automationScriptLink ?? null,

        tags: data.tags ?? [],
        createdById: userId,

        steps: {
          create: data.steps.map(
            (step: CreateTestCaseInput["steps"][number]) => ({
              stepNumber: step.stepNumber,
              action: step.action,
              testData: step.testData ?? null,
              expectedResult: step.expectedResult,
            })
          ),
        },
      },
      include: {
        steps: true,
      },
    });

    return testCase;
  });
}
