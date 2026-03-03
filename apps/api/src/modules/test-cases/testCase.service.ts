import { prisma } from "../../prisma";
import { CreateTestCaseInput, UpdateTestCaseInput } from "./testCase.schema";
import {
  TestCasePriority,
  TestCaseStatus,
  UserRole,
} from "@prisma/client";

/* ============================
   CREATE TEST CASE
============================ */

function generateTestCaseId(sequence: number): string {
  const year = new Date().getFullYear();
  return `TC-${year}-${sequence.toString().padStart(5, "0")}`;
}

export async function createTestCase(
  projectId: string,
  data: CreateTestCaseInput,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    const count = await tx.testCase.count({ where: { projectId } });
    const testCaseId = generateTestCaseId(count + 1);

    return tx.testCase.create({
      data: {
        testCaseId,
        projectId,
        createdById: userId,

        title: data.title,
        description: data.description ?? null,
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

        steps: {
          create: data.steps.map((step) => ({
            stepNumber: step.stepNumber,
            action: step.action,
            testData: step.testData ?? null,
            expectedResult: step.expectedResult,
          })),
        },
      },
      include: { steps: true },
    });
  });
}

/* ============================
   LIST TEST CASES
============================ */

export async function listTestCases(
  projectId: string,
  params: {
    page: number;
    limit: number;
    status?: TestCaseStatus;
    priority?: TestCasePriority;
    module?: string;
    search?: string;
    userId: string;
    role: UserRole;
  }
) {
  const { page, limit, status, priority, module, search, userId, role } =
    params;

  const skip = (page - 1) * limit;

  const where: any = { projectId };

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
      include: { steps: true },
    }),
  ]);

  return { total, items };
}

/* ============================
   VIEW TEST CASE (FR-TC-003)
   ============================ */
export async function getTestCaseById(
  projectId: string,
  id: string,
  userId: string,
  role: UserRole
) {
  const where: any = { id, projectId };

  if (role === UserRole.TESTER) {
    where.createdById = userId;
  }

  return prisma.testCase.findFirst({
    where,
    include: { steps: { orderBy: { stepNumber: "asc" } } },
  });
}

/* ============================
   UPDATE TEST CASE (FR-TC-002)
   ============================ */
export async function updateTestCase(
  projectId: string,
  id: string,
  data: UpdateTestCaseInput,
  userId: string,
  role: UserRole
) {
  const where: any = { id, projectId };

  if (role === UserRole.TESTER) {
    where.createdById = userId;
  }

  const existing = await prisma.testCase.findFirst({
    where,
  });

  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
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

    for (const key in data) {
      if (
        data[key as keyof UpdateTestCaseInput] !== undefined &&
        key !== "steps"
      ) {
        updateData[key] = data[key as keyof UpdateTestCaseInput];
      }
    }

    updateData.version = { increment: 1 };

    return tx.testCase.update({
      where: { id },
      data: updateData,
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
      },
    });
  });
}

/* ============================
   CLONE TEST CASE (FR-TC-003)
   ============================ */

export async function cloneTestCase(
  projectId: string,
  id: string,
  userId: string,
  role: UserRole
) {
  const where: any = { id, projectId };

  if (role === UserRole.TESTER) {
    where.createdById = userId;
  }

  const existing = await prisma.testCase.findFirst({
    where,
    include: { steps: true },
  });

  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    const count = await tx.testCase.count({
      where: { projectId },
    });

    const year = new Date().getFullYear();
    const newTestCaseId = `TC-${year}-${(count + 1)
      .toString()
      .padStart(5, "0")}`;

    return tx.testCase.create({
      data: {
        testCaseId: newTestCaseId,
        title: existing.title + " (Clone)",
        description: existing.description,
        module: existing.module,
        priority: existing.priority,
        severity: existing.severity,
        type: existing.type,
        status: "DRAFT",

        preConditions: existing.preConditions,
        testDataRequirements: existing.testDataRequirements,
        environmentRequirements: existing.environmentRequirements,
        postConditions: existing.postConditions,
        cleanupSteps: existing.cleanupSteps,
        estimatedDuration: existing.estimatedDuration,
        automationStatus: existing.automationStatus,
        automationScriptLink: existing.automationScriptLink,
        tags: existing.tags,

        version: 1,
        createdById: userId,
        projectId,

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
        steps: { orderBy: { stepNumber: "asc" } },
      },
    });
  });
}

/* ============================
   DELETE TEST CASE (FR-TC-004)
   ============================ */

export async function deleteTestCase(
  projectId: string,
  id: string,
  userId: string,
  role: UserRole
) {
  const where: any = { id, projectId };

  if (role === UserRole.TESTER) {
    where.createdById = userId;
  }

  const existing = await prisma.testCase.findFirst({
    where,
  });

  if (!existing) return null;

  return prisma.testCase.update({
    where: { id },
    data: {
      status: TestCaseStatus.ARCHIVED,
    },
  });
}