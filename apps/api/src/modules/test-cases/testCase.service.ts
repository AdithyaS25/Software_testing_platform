import { prisma } from "../../prisma";
import { CreateTestCaseInput } from "./testCase.schema";
import {
  TestCasePriority,
  TestCaseStatus,
  UserRole,
} from "@prisma/client";
import { UpdateTestCaseInput } from "./testCase.schema";


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
  const {
    page,
    limit,
    status,
    priority,
    module,
    search,
    userId,
    role,
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { testCaseId: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { module: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role === UserRole.TESTER) {
    where.createdById = userId;
  }

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (module) where.module = module;

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

  return { total, items };
}

/* ============================
   VIEW TEST CASE (FR-TC-003)
   ============================ */

export async function getTestCaseById(
  id: string,
  userId: string,
  role: UserRole
) {
  const where: any = { id };

  if (role === UserRole.TESTER) {
    where.createdById = userId;
  }

  return prisma.testCase.findFirst({
    where,
    include: {
      steps: {
        orderBy: { stepNumber: "asc" },
      },
    },
  });
}

/* ============================
   UPDATE TEST CASE (FR-TC-002)
   ============================ */
export async function updateTestCase(
  id: string,
  data: UpdateTestCaseInput,
  userId: string,
  role: UserRole
) {
  const where: any = { id };

  // 🔐 Testers can edit only their own test cases
  if (role === UserRole.TESTER) {
    where.createdById = userId;
  }

  const existing = await prisma.testCase.findFirst({
    where,
  });

  if (!existing) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    // If steps provided → replace them
    if (data.steps) {
      await tx.testStep.deleteMany({
        where: { testCaseId: id },
      });

      await tx.testStep.createMany({
        data: data.steps.map((step) => ({
          testCaseId: id,
          stepNumber: step.stepNumber,
          action: step.action,
          testData: step.testData ?? null,
          expectedResult: step.expectedResult,
        })),
      });
    }

    const updateData: any = {};

// Only assign defined fields
for (const key in data) {
  if (data[key as keyof UpdateTestCaseInput] !== undefined && key !== "steps") {
    updateData[key] = data[key as keyof UpdateTestCaseInput];
  }
}

// Always increment version
updateData.version = { increment: 1 };

const updated = await tx.testCase.update({
  where: { id },
  data: updateData,
  include: {
    steps: {
      orderBy: { stepNumber: "asc" },
    },
  },
});

    return updated;
  });
}

/* ============================
   CLONE TEST CASE (FR-TC-003)
   ============================ */

export async function cloneTestCase(
  id: string,
  userId: string,
  role: UserRole
) {
  const where: any = { id };

  // 🔐 Testers can clone only their own test cases
  if (role === UserRole.TESTER) {
    where.createdById = userId;
  }

  const existing = await prisma.testCase.findFirst({
    where,
    include: {
      steps: true,
    },
  });

  if (!existing) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    // Generate new sequential TestCaseId
    const count = await tx.testCase.count();
    const year = new Date().getFullYear();
    const newTestCaseId = `TC-${year}-${(count + 1)
      .toString()
      .padStart(5, "0")}`;

    // Create cloned test case
    const cloned = await tx.testCase.create({
      data: {
        testCaseId: newTestCaseId,
        title: existing.title + " (Clone)",
        description: existing.description,
        module: existing.module,
        priority: existing.priority,
        severity: existing.severity,
        type: existing.type,
        status: "DRAFT", // Reset to draft
        preConditions: existing.preConditions,
        testDataRequirements: existing.testDataRequirements,
        environmentRequirements: existing.environmentRequirements,
        postConditions: existing.postConditions,
        cleanupSteps: existing.cleanupSteps,
        estimatedDuration: existing.estimatedDuration,
        automationStatus: existing.automationStatus,
        automationScriptLink: existing.automationScriptLink,
        tags: existing.tags,
        version: 1, // 🔑 Reset version
        createdById: userId, // 🔑 New creator

        steps: {
          create: existing.steps.map((step) => ({
            stepNumber: step.stepNumber,
            action: step.action,
            testData: step.testData,
            expectedResult: step.expectedResult,
          })),
        },
      },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
        },
      },
    });

    return cloned;
  });
}

/* ============================
   DELETE TEST CASE (FR-TC-004)
   ============================ */

export async function deleteTestCase(
  id: string,
  userId: string,
  role: UserRole
) {
  const where: any = { id };

  // 🔐 Testers can delete only their own test cases
  if (role === UserRole.TESTER) {
    where.createdById = userId;
  }

  const existing = await prisma.testCase.findFirst({ where });

  if (!existing) {
    return null;
  }

  // Soft delete → set status to ARCHIVED
  return prisma.testCase.update({
    where: { id },
    data: {
      status: TestCaseStatus.ARCHIVED,
    },
  });
}
