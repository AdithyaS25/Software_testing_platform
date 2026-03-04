"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestCase = createTestCase;
exports.listTestCases = listTestCases;
exports.getTestCaseById = getTestCaseById;
exports.updateTestCase = updateTestCase;
exports.cloneTestCase = cloneTestCase;
exports.deleteTestCase = deleteTestCase;
const prisma_1 = require("../../prisma");
const client_1 = require("@prisma/client");
/* ============================
   ID GENERATION
============================ */
/**
 * Generates a unique testCaseId by finding the highest existing sequence
 * number across ALL test cases (globally), then incrementing it.
 * Using count() causes collisions when records are deleted or when
 * multiple projects exist — max sequence is always safe.
 */
async function nextTestCaseId(tx) {
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
        if (!isNaN(seq))
            next = seq + 1;
    }
    return `${prefix}${next.toString().padStart(5, "0")}`;
}
/* ============================
   CREATE TEST CASE
============================ */
async function createTestCase(projectId, data, userId) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const testCaseId = await nextTestCaseId(tx);
        return tx.testCase.create({
            data: {
                testCaseId,
                projectId,
                createdById: userId,
                title: data.title,
                description: data.description ?? "",
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
async function listTestCases(projectId, params) {
    const { page, limit, status, priority, module, search, userId, role } = params;
    const skip = (page - 1) * limit;
    const where = { projectId };
    if (search) {
        where.OR = [
            { testCaseId: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
            { module: { contains: search, mode: "insensitive" } },
        ];
    }
    if (role === client_1.UserRole.TESTER) {
        where.createdById = userId;
    }
    if (status)
        where.status = status;
    if (priority)
        where.priority = priority;
    if (module)
        where.module = module;
    const [total, items] = await Promise.all([
        prisma_1.prisma.testCase.count({ where }),
        prisma_1.prisma.testCase.findMany({
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
async function getTestCaseById(projectId, id, userId, role) {
    const where = { id, projectId };
    if (role === client_1.UserRole.TESTER)
        where.createdById = userId;
    return prisma_1.prisma.testCase.findFirst({
        where,
        include: { steps: { orderBy: { stepNumber: "asc" } } },
    });
}
/* ============================
   UPDATE TEST CASE
============================ */
async function updateTestCase(projectId, id, data, userId, role) {
    const where = { id, projectId };
    if (role === client_1.UserRole.TESTER)
        where.createdById = userId;
    const existing = await prisma_1.prisma.testCase.findFirst({ where });
    if (!existing)
        return null;
    return prisma_1.prisma.$transaction(async (tx) => {
        if (data.steps) {
            await tx.testStep.deleteMany({ where: { testCaseId: id } });
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
        const updateData = {};
        for (const key in data) {
            if (data[key] !== undefined && key !== "steps") {
                updateData[key] = data[key];
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
async function cloneTestCase(projectId, id, userId, role) {
    const where = { id, projectId };
    if (role === client_1.UserRole.TESTER)
        where.createdById = userId;
    const existing = await prisma_1.prisma.testCase.findFirst({
        where,
        include: { steps: true },
    });
    if (!existing)
        return null;
    return prisma_1.prisma.$transaction(async (tx) => {
        const testCaseId = await nextTestCaseId(tx);
        return tx.testCase.create({
            data: {
                testCaseId,
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
            include: { steps: { orderBy: { stepNumber: "asc" } } },
        });
    });
}
/* ============================
   DELETE TEST CASE
============================ */
async function deleteTestCase(projectId, id, userId, role) {
    const where = { id, projectId };
    if (role === client_1.UserRole.TESTER)
        where.createdById = userId;
    const existing = await prisma_1.prisma.testCase.findFirst({ where });
    if (!existing)
        return null;
    return prisma_1.prisma.testCase.update({
        where: { id },
        data: { status: client_1.TestCaseStatus.ARCHIVED },
    });
}
//# sourceMappingURL=testCase.service.js.map