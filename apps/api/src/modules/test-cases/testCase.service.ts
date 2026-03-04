import { prisma } from "../../prisma";
import { CreateTestCaseInput, UpdateTestCaseInput } from "./testCase.schema";
import {
  TestCasePriority,
  TestCaseStatus,
  UserRole,
} from "@prisma/client";

/* ============================
   ID GENERATION
============================ */

/**
 * Generates a unique testCaseId by finding the highest existing sequence
 * number across ALL test cases (globally), then incrementing it.
 * Using count() causes collisions when records are deleted or when
 * multiple projects exist — max sequence is always safe.
 */
async function nextTestCaseId(tx: typeof prisma): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TC-${year}-`;

  // Find the highest sequence number used this year
  const last = await tx.testCase.findFirst({
    where: { testCaseId: { startsWith: prefix } },
    orderBy: { testCaseId: "desc" },
    select: { testCaseId: true },
  });

  let next = 1;
  if (last?.testCaseId) {
    const seq = parseInt(last.testCaseId.replace(prefix, ""), 10);
    if (!isNaN(seq)) next = seq + 1;
  }

  return `${prefix}${next.toString().padStart(5, "0")}`;
}

/* ============================
   CREATE TEST CASE
============================ */

export async function createTestCase(
  projectId: string,
  data: CreateTestCaseInput,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    const testCaseId = await nextTestCaseId(tx as any);

    return tx.testCase.create({
      data: {
        testCaseId,
        projectId,
        createdById: userId,

        title:       data.title,
        description: data.description ?? "",
        module:      data.module,
        priority:    data.priority,
        severity:    data.severity,
        type:        data.type,
        status:      data.status,

        preConditions:           data.preConditions           ?? null,
        testDataRequirements:    data.testDataRequirements    ?? null,
        environmentRequirements: data.environmentRequirements ?? null,
        postConditions:          data.postConditions          ?? null,
        cleanupSteps:            data.cleanupSteps            ?? null,

        estimatedDuration:    data.estimatedDuration    ?? null,
        automationStatus:     data.automationStatus,
        automationScriptLink: data.automationScriptLink ?? null,

        tags: data.tags ?? [],

        steps: {
          create: data.steps.map((step) => ({
            stepNumber:     step.stepNumber,
            action:         step.action,
            testData:       step.testData ?? null,
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
  const { page, limit, status, priority, module, search, userId, role } = params;
  const skip = (page - 1) * limit;
  const where: any = { projectId };

  if (search) {
    where.OR = [
      { testCaseId: { contains: search, mode: "insensitive" } },
      { title:      { contains: search, mode: "insensitive" } },
      { module:     { contains: search, mode: "insensitive" } },
    ];
  }

  if (role === UserRole.TESTER) {
    where.createdById = userId;
  }

  if (status)   where.status   = status;
  if (priority) where.priority = priority;
  if (module)   where.module   = module;

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
   VIEW TEST CASE
============================ */

export async function getTestCaseById(
  projectId: string,
  id: string,
  userId: string,
  role: UserRole
) {
  const where: any = { id, projectId };
  if (role === UserRole.TESTER) where.createdById = userId;

  return prisma.testCase.findFirst({
    where,
    include: { steps: { orderBy: { stepNumber: "asc" } } },
  });
}

/* ============================
   UPDATE TEST CASE
============================ */

export async function updateTestCase(
  projectId: string,
  id: string,
  data: UpdateTestCaseInput,
  userId: string,
  role: UserRole
) {
  const where: any = { id, projectId };
  if (role === UserRole.TESTER) where.createdById = userId;

  const existing = await prisma.testCase.findFirst({ where });
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    if (data.steps) {
      await tx.testStep.deleteMany({ where: { testCaseId: id } });
      await tx.testStep.createMany({
        data: data.steps.map((step) => ({
          testCaseId:     id,
          stepNumber:     step.stepNumber,
          action:         step.action,
          testData:       step.testData ?? null,
          expectedResult: step.expectedResult,
        })),
      });
    }

    const updateData: any = {};
    for (const key in data) {
      if (data[key as keyof UpdateTestCaseInput] !== undefined && key !== "steps") {
        updateData[key] = data[key as keyof UpdateTestCaseInput];
      }
    }
    updateData.version = { increment: 1 };

    return tx.testCase.update({
      where: { id },
      data: updateData,
      include: { steps: { orderBy: { stepNumber: "asc" } } },
    });
  });
}

/* ============================
   CLONE TEST CASE
============================ */

export async function cloneTestCase(
  projectId: string,
  id: string,
  userId: string,
  role: UserRole
) {
  const where: any = { id, projectId };
  if (role === UserRole.TESTER) where.createdById = userId;

  const existing = await prisma.testCase.findFirst({
    where,
    include: { steps: true },
  });
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    const testCaseId = await nextTestCaseId(tx as any);

    return tx.testCase.create({
      data: {
        testCaseId,
        title:                   existing.title + " (Clone)",
        description:             existing.description,
        module:                  existing.module,
        priority:                existing.priority,
        severity:                existing.severity,
        type:                    existing.type,
        status:                  "DRAFT",
        preConditions:           existing.preConditions,
        testDataRequirements:    existing.testDataRequirements,
        environmentRequirements: existing.environmentRequirements,
        postConditions:          existing.postConditions,
        cleanupSteps:            existing.cleanupSteps,
        estimatedDuration:       existing.estimatedDuration,
        automationStatus:        existing.automationStatus,
        automationScriptLink:    existing.automationScriptLink,
        tags:                    existing.tags,
        version:                 1,
        createdById:             userId,
        projectId,
        steps: {
          create: existing.steps.map((step) => ({
            stepNumber:     step.stepNumber,
            action:         step.action,
            testData:       step.testData,
            expectedResult: step.expectedResult,
          })),
        },
      },
      include: { steps: { orderBy: { stepNumber: "asc" } } },
    });
  });
}

/* ============================
   DELETE TEST CASE
============================ */

export async function deleteTestCase(
  projectId: string,
  id: string,
  userId: string,
  role: UserRole
) {
  const where: any = { id, projectId };
  if (role === UserRole.TESTER) where.createdById = userId;

  const existing = await prisma.testCase.findFirst({ where });
  if (!existing) return null;

  return prisma.testCase.update({
    where: { id },
    data: { status: TestCaseStatus.ARCHIVED },
  });
}
