"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuiteExecutionReport = exports.completeSuiteExecution = exports.executeSuite = void 0;
const prisma_1 = require("../../prisma");
const client_1 = require("@prisma/client");
const executeSuite = async (projectId, suiteId, userId, executionMode) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        const suite = await tx.testSuite.findFirst({
            where: { id: suiteId, projectId },
            include: { testCases: true },
        });
        if (!suite)
            throw new Error("Suite not found in project");
        const suiteExecution = await tx.testSuiteExecution.create({
            data: {
                suiteId,
                executedById: userId,
                executionMode,
                status: client_1.SuiteExecutionStatus.IN_PROGRESS,
                totalTests: suite.testCases.length,
            },
        });
        await tx.execution.createMany({
            data: suite.testCases.map((tc) => ({
                testCaseId: tc.id,
                executedById: userId,
                suiteExecutionId: suiteExecution.id,
                status: client_1.ExecutionStatus.IN_PROGRESS,
            })),
        });
        return suiteExecution;
    });
};
exports.executeSuite = executeSuite;
const completeSuiteExecution = async (suiteExecutionId) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        const suiteExecution = await tx.testSuiteExecution.findUnique({
            where: { id: suiteExecutionId },
        });
        if (!suiteExecution) {
            throw new Error("Suite execution not found");
        }
        // 🔥 Aggregate execution results
        const executions = await tx.execution.findMany({
            where: { suiteExecutionId },
        });
        const total = executions.length;
        const passed = executions.filter((e) => e.status === "PASSED").length;
        const failed = executions.filter((e) => e.status === "FAILED").length;
        const blocked = executions.filter((e) => e.status === "BLOCKED").length;
        const skipped = executions.filter((e) => e.status === "SKIPPED").length;
        const updatedSuiteExecution = await tx.testSuiteExecution.update({
            where: { id: suiteExecutionId },
            data: {
                passed,
                failed,
                blocked,
                skipped,
                status: "COMPLETED",
                completedAt: new Date(),
            },
        });
        return {
            ...updatedSuiteExecution,
            passRate: total === 0 ? 0 : Math.round((passed / total) * 100),
        };
    });
};
exports.completeSuiteExecution = completeSuiteExecution;
const getSuiteExecutionReport = async (suiteExecutionId) => {
    const suiteExecution = await prisma_1.prisma.testSuiteExecution.findUnique({
        where: { id: suiteExecutionId },
        include: {
            suite: true,
            executions: {
                include: {
                    testCase: true,
                },
            },
        },
    });
    if (!suiteExecution) {
        throw new Error("Suite execution not found");
    }
    return {
        suite: {
            id: suiteExecution.suite.id,
            name: suiteExecution.suite.name,
            module: suiteExecution.suite.module,
        },
        summary: {
            totalTests: suiteExecution.totalTests,
            passed: suiteExecution.passed,
            failed: suiteExecution.failed,
            blocked: suiteExecution.blocked,
            skipped: suiteExecution.skipped,
            status: suiteExecution.status,
            startedAt: suiteExecution.startedAt,
            completedAt: suiteExecution.completedAt,
        },
        executions: suiteExecution.executions.map((execution) => ({
            executionId: execution.id,
            status: execution.status,
            testCase: {
                id: execution.testCase.id,
                title: execution.testCase.title,
                module: execution.testCase.module,
            },
        })),
    };
};
exports.getSuiteExecutionReport = getSuiteExecutionReport;
//# sourceMappingURL=testSuite.service.js.map