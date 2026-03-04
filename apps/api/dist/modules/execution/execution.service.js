"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeExecutionService = exports.updateExecutionService = exports.createExecutionService = void 0;
const prisma_1 = require("../../prisma"); // adjust if your prisma import path differs
const client_1 = require("@prisma/client");
// 1️⃣ Create Execution
const createExecutionService = async (testCaseId, testRunId, userId) => {
    if (!testCaseId) {
        throw new Error("Test case ID is required");
    }
    if (!testRunId) {
        throw new Error("Test run ID is required");
    }
    // Validate test case
    const testCase = await prisma_1.prisma.testCase.findUnique({
        where: { id: testCaseId },
        include: { steps: true },
    });
    if (!testCase) {
        throw new Error("Test case not found");
    }
    // Validate test run exists
    const testRun = await prisma_1.prisma.testRun.findUnique({
        where: { id: testRunId },
    });
    if (!testRun) {
        throw new Error("Test run not found");
    }
    // ✅ CHECK IF EXECUTION ALREADY EXISTS (IDEMPOTENT GUARD)
    const existingExecution = await prisma_1.prisma.execution.findFirst({
        where: {
            testCaseId,
            testRunId,
            executedById: userId,
            status: client_1.ExecutionStatus.IN_PROGRESS,
        },
        include: {
            steps: true,
        },
    });
    if (existingExecution) {
        return existingExecution;
    }
    // ✅ CREATE NEW EXECUTION
    const execution = await prisma_1.prisma.execution.create({
        data: {
            testCaseId,
            testRunId,
            executedById: userId,
            status: client_1.ExecutionStatus.IN_PROGRESS,
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
exports.createExecutionService = createExecutionService;
// 2️⃣ Update Execution (Step status + actual result)
const updateExecutionService = async (executionId, payload) => {
    const { status, steps } = payload;
    const execution = await prisma_1.prisma.execution.findUnique({
        where: { id: executionId },
    });
    if (!execution) {
        throw new Error("Execution not found");
    }
    // 🔹 Update execution status
    if (status) {
        await prisma_1.prisma.execution.update({
            where: { id: executionId },
            data: { status }, // ✅ Now correctly typed
        });
    }
    // 🔹 Update execution steps
    if (steps && Array.isArray(steps)) {
        for (const step of steps) {
            const updateData = {};
            if (step.status)
                updateData.status = step.status;
            if (step.actualResult)
                updateData.actualResult = step.actualResult;
            if (step.notes)
                updateData.notes = step.notes;
            await prisma_1.prisma.executionStep.update({
                where: { id: step.id },
                data: updateData,
            });
        }
    }
    return prisma_1.prisma.execution.findUnique({
        where: { id: executionId },
        include: { steps: true },
    });
};
exports.updateExecutionService = updateExecutionService;
// 3️⃣ Complete Execution
const completeExecutionService = async (executionId) => {
    const execution = await prisma_1.prisma.execution.findUnique({
        where: { id: executionId },
        include: { steps: true },
    });
    if (!execution) {
        throw new Error("Execution not found");
    }
    // Calculate overall result
    let overallResult = "PASS";
    if (execution.steps.some((step) => step.status === "FAIL")) {
        overallResult = "FAIL";
    }
    else if (execution.steps.some((step) => step.status === "BLOCKED")) {
        overallResult = "BLOCKED";
    }
    const completedExecution = await prisma_1.prisma.execution.update({
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
    const testRunCases = await prisma_1.prisma.testRunTestCase.findMany({
        where: {
            testCaseId: execution.testCaseId,
        },
    });
    // Mark them as COMPLETED
    for (const trc of testRunCases) {
        await prisma_1.prisma.testRunTestCase.update({
            where: { id: trc.id },
            data: { status: "COMPLETED" },
        });
    }
    // Check if TestRun should be completed
    for (const trc of testRunCases) {
        const runCases = await prisma_1.prisma.testRunTestCase.findMany({
            where: { testRunId: trc.testRunId },
        });
        const allCompleted = runCases.every((rc) => rc.status === "COMPLETED");
        if (allCompleted) {
            await prisma_1.prisma.testRun.update({
                where: { id: trc.testRunId },
                data: { status: "COMPLETED" },
            });
        }
    }
    return completedExecution;
};
exports.completeExecutionService = completeExecutionService;
//# sourceMappingURL=execution.service.js.map