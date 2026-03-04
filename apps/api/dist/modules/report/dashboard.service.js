"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDashboardReport = void 0;
const prisma_1 = require("../../prisma");
const generateDashboardReport = async (projectId) => {
    // =============================
    // SUMMARY METRICS (PROJECT SCOPED)
    // =============================
    const totalTestRuns = await prisma_1.prisma.testRun.count({
        where: { projectId },
    });
    const totalExecutions = await prisma_1.prisma.execution.count({
        where: {
            testRun: { projectId },
        },
    });
    const totalBugs = await prisma_1.prisma.bug.count({
        where: { projectId },
    });
    const passedExecutions = await prisma_1.prisma.execution.count({
        where: {
            overallResult: "PASS",
            testRun: { projectId },
        },
    });
    const overallPassRate = totalExecutions > 0
        ? Number(((passedExecutions / totalExecutions) * 100).toFixed(1))
        : 0;
    const openBugs = await prisma_1.prisma.bug.count({
        where: {
            projectId,
            resolvedAt: null,
        },
    });
    const criticalBugs = await prisma_1.prisma.bug.count({
        where: {
            projectId,
            severity: "CRITICAL",
        },
    });
    // =============================
    // DATE RANGE (Last 7 Days)
    // =============================
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    // =============================
    // EXECUTION TREND (PROJECT SCOPED)
    // =============================
    const executions = await prisma_1.prisma.execution.findMany({
        where: {
            completedAt: {
                not: null,
                gte: sevenDaysAgo,
            },
            testRun: { projectId },
        },
        select: { completedAt: true },
    });
    const executionMap = {};
    executions.forEach((e) => {
        if (!e.completedAt)
            return;
        const date = e.completedAt.toISOString().split("T")[0];
        if (!date)
            return;
        executionMap[date] = (executionMap[date] ?? 0) + 1;
    });
    const executionTrend = Object.entries(executionMap).map(([date, total]) => ({
        date,
        total,
    }));
    // =============================
    // BUG TREND (PROJECT SCOPED)
    // =============================
    const bugs = await prisma_1.prisma.bug.findMany({
        where: {
            projectId,
            createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
    });
    const bugMap = {};
    bugs.forEach((b) => {
        const date = b.createdAt.toISOString().split("T")[0];
        if (!date)
            return;
        bugMap[date] = (bugMap[date] ?? 0) + 1;
    });
    const bugTrend = Object.entries(bugMap).map(([date, total]) => ({
        date,
        total,
    }));
    return {
        summary: {
            totalTestRuns,
            totalExecutions,
            overallPassRate,
            totalBugs,
            openBugs,
            criticalBugs,
        },
        executionTrend,
        bugTrend,
    };
};
exports.generateDashboardReport = generateDashboardReport;
//# sourceMappingURL=dashboard.service.js.map