"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTesterPerformanceReport = void 0;
const prisma_1 = require("../../prisma");
const generateTesterPerformanceReport = async () => {
    // Group executions by tester
    const grouped = await prisma_1.prisma.execution.groupBy({
        by: ["executedById"],
        _count: { id: true },
    });
    const testers = await Promise.all(grouped.map(async (g) => {
        const testerId = g.executedById;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: testerId },
        });
        const executions = await prisma_1.prisma.execution.findMany({
            where: { executedById: testerId },
        });
        const totalExecutions = executions.length;
        const passed = executions.filter((e) => e.overallResult === "PASS").length;
        const failed = executions.filter((e) => e.overallResult === "FAIL").length;
        const blocked = executions.filter((e) => e.overallResult === "BLOCKED").length;
        const skipped = executions.filter((e) => e.overallResult === "SKIPPED").length;
        const passRate = totalExecutions > 0
            ? Number(((passed / totalExecutions) *
                100).toFixed(1))
            : 0;
        const executionDurations = executions
            .filter((e) => e.startedAt &&
            e.completedAt)
            .map((e) => {
            const diff = e.completedAt.getTime() -
                e.startedAt.getTime();
            return diff / (1000 * 60); // minutes
        });
        const averageExecutionMinutes = executionDurations.length > 0
            ? Number((executionDurations.reduce((a, b) => a + b, 0) / executionDurations.length).toFixed(1))
            : 0;
        const bugsRaised = await prisma_1.prisma.bug.count({
            where: {
                execution: {
                    executedById: testerId,
                },
            },
        });
        return {
            testerId,
            testerEmail: user?.email ?? "Unknown",
            totalExecutions,
            passed,
            failed,
            blocked,
            skipped,
            passRate,
            averageExecutionMinutes,
            bugsRaised,
        };
    }));
    return { testers };
};
exports.generateTesterPerformanceReport = generateTesterPerformanceReport;
//# sourceMappingURL=tester-performance.service.js.map