"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignTestRunCaseService = exports.getTestRunByIdService = exports.getAllTestRunsService = exports.createTestRunService = void 0;
const prisma_1 = require("../../prisma");
const createTestRunService = async (projectId, name, description, startDate, endDate, testCaseIds, createdById) => {
    return prisma_1.prisma.$transaction(async (tx) => {
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
exports.createTestRunService = createTestRunService;
const getAllTestRunsService = async (projectId) => {
    return prisma_1.prisma.testRun.findMany({
        where: { projectId },
        include: {
            testCases: {
                include: { testCase: true },
            },
            createdBy: true,
        },
    });
};
exports.getAllTestRunsService = getAllTestRunsService;
const getTestRunByIdService = async (projectId, id) => {
    return prisma_1.prisma.testRun.findFirst({
        where: { id, projectId },
        include: {
            testCases: {
                include: { testCase: true },
            },
            createdBy: true,
        },
    });
};
exports.getTestRunByIdService = getTestRunByIdService;
const assignTestRunCaseService = async (testRunTestCaseId, assignedToId) => {
    return prisma_1.prisma.testRunTestCase.update({
        where: { id: testRunTestCaseId },
        data: { assignedToId },
    });
};
exports.assignTestRunCaseService = assignTestRunCaseService;
//# sourceMappingURL=testRun.service.js.map