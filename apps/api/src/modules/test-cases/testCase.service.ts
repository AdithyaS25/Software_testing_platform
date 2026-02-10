import { prisma } from "../../prisma";
import { CreateTestCaseInput } from "./testCase.schema";
import {
  TestCasePriority,
  TestCaseStatus,
  UserRole,
} from "@prisma/client";

/* ============================
   CREATE TEST CASE (FR-TC-001)
   ============================ */

function generateTestCaseId(sequence: number): string {
  const year = new Date().getFullYear();
  return `TC-${year}-${sequence.toString().padStart(5, "0")}`;
}

export async function createTestCase(
  data: CreateTestCaseInput,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
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

/* ============================
   LIST TEST CASES (FR-TC-002)
   ============================ */

interface ListTestCasesParams {
  page: number;
  limit: number;
  status: TestCaseStatus | undefined;
  priority: TestCasePriority | undefined;
  module: string | undefined;
  search: string | undefined;
  userId: string;
  role: UserRole;
}

export async function listTestCases(params: ListTestCasesParams) {
  const { page, limit, status, priority, module, search, userId, role } = params;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
  where.OR = [
    {
      testCaseId: {
        contains: search,
        mode: "insensitive",
      },
    },
    {
      title: {
        contains: search,
        mode: "insensitive",
      },
    },
    {
      module: {
        contains: search,
        mode: "insensitive",
      },
    },
  ];
}


  if (role === UserRole.TESTER) {
    where.createdById = userId;
  }

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (module) {
    where.module = module;
  }

  const [total, items] = await Promise.all([
    prisma.testCase.count({ where }),
    prisma.testCase.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        testCaseId: true,
        title: true,
        module: true,
        priority: true,
        severity: true,
        status: true,
        version: true,
        createdAt: true,
        createdById: true,
      },
    }),
  ]);

  return {
    total,
    items,
  };
}
