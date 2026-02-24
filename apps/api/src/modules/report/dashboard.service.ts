import { prisma } from "../../prisma";
import { DashboardReport } from "./dashboard.types";

export const generateDashboardReport =
  async (): Promise<DashboardReport> => {
    // =============================
    // SUMMARY METRICS
    // =============================

    const totalTestRuns = await prisma.testRun.count();
    const totalExecutions = await prisma.execution.count();
    const totalBugs = await prisma.bug.count();

    const passedExecutions = await prisma.execution.count({
      where: { overallResult: "PASS" },
    });

    const overallPassRate =
      totalExecutions > 0
        ? Number(
            (
              (passedExecutions / totalExecutions) *
              100
            ).toFixed(1)
          )
        : 0;

    const openBugs = await prisma.bug.count({
      where: { resolvedAt: null },
    });

    const criticalBugs = await prisma.bug.count({
      where: { severity: "CRITICAL" },
    });

    // =============================
    // DATE RANGE (Last 7 Days)
    // =============================

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // =============================
    // EXECUTION TREND
    // =============================

    const executions = await prisma.execution.findMany({
      where: {
        completedAt: {
          not: null,
          gte: sevenDaysAgo,
        },
      },
      select: { completedAt: true },
    });

    const executionMap: Record<string, number> = {};

    executions.forEach((e) => {
      if (!e.completedAt) return;

      const iso = e.completedAt.toISOString();
      const date = iso.split("T")[0];

      if (!date) return;

      executionMap[date] =
        (executionMap[date] ?? 0) + 1;
    });

    const executionTrend = Object.entries(
      executionMap
    ).map(([date, total]) => ({
      date,
      total,
    }));

    // =============================
    // BUG TREND
    // =============================

    const bugs = await prisma.bug.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true },
    });

    const bugMap: Record<string, number> = {};

    bugs.forEach((b) => {
      const iso = b.createdAt.toISOString();
      const date = iso.split("T")[0];

      if (!date) return;

      bugMap[date] =
        (bugMap[date] ?? 0) + 1;
    });

    const bugTrend = Object.entries(bugMap).map(
      ([date, total]) => ({
        date,
        total,
      })
    );

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
  