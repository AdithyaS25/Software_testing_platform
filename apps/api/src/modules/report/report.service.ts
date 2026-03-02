import { prisma } from "../../prisma";
import { TestExecutionReport } from "./report.types";
import { ExecutionStatus, StepStatus } from "@prisma/client";

export async function generateTestExecutionReport(
  projectId: string,
  testRunId: string
){

  const testRun = await prisma.testRun.findFirst({
    where: { 
      id: testRunId, 
      projectId 
    },
      include: {
      executions: true,
    },
  });

  if (!testRun) {
    throw new Error("Test Run not found for this project");
  }


  // =============================
  // SUMMARY
  // =============================

  const totalExecuted = await prisma.execution.count({
    where: {
      testRunId,
      overallResult: { not: null }
    }
  });

  const statusBreakdown = await prisma.execution.groupBy({
    by: ["overallResult"],
    where: {
      testRunId,
      overallResult: { not: null }
    },
    _count: { overallResult: true }
  });

  let passed = 0;
  let failed = 0;
  let blocked = 0;
  let skipped = 0;

  statusBreakdown.forEach((item: {
    overallResult: StepStatus | null;
    _count: { overallResult: number };
  }) => {
    if (item.overallResult === "PASS") passed = item._count.overallResult;
    if (item.overallResult === "FAIL") failed = item._count.overallResult;
    if (item.overallResult === "BLOCKED") blocked = item._count.overallResult;
    if (item.overallResult === "SKIPPED") skipped = item._count.overallResult;
  });

  const passRate = totalExecuted
    ? Number(((passed / totalExecuted) * 100).toFixed(1))
    : 0;

  // =============================
  // EXECUTION BY TESTER
  // =============================

  const executionByTesterRaw = await prisma.execution.groupBy({
    by: ["executedById"],
    where: { testRunId },
    _count: { id: true }
  });

  const executionByTester = await Promise.all(
    executionByTesterRaw.map(async (entry: {
      executedById: string;
      _count: { id: number };
    }) => {
      const user = await prisma.user.findUnique({
        where: { id: entry.executedById }
      });

      return {
        testerId: entry.executedById,
        testerEmail: user?.email ?? "Unknown",
        total: entry._count.id
      };
    })
  );

  // =============================
  // EXECUTION BY MODULE
  // =============================

  const executions = await prisma.execution.findMany({
    where: { testRunId },
    include: { testCase: true }
  });

  const moduleMap: Record<string, { total: number; failed: number }> = {};

  executions.forEach((exec) => {
    const module = exec.testCase.module;

    if (!moduleMap[module]) {
      moduleMap[module] = { total: 0, failed: 0 };
    }

    moduleMap[module].total++;

    if (exec.overallResult === "FAIL") {
      moduleMap[module].failed++;
    }
  });

  const executionByModule = Object.entries(moduleMap).map(
    ([module, data]) => ({
      module,
      total: data.total,
      failed: data.failed
    })
  );

  // =============================
// TIMELINE (Grouped by Date)
// =============================

const timelineRaw = await prisma.execution.findMany({
  where: {
    testRunId,
    completedAt: { not: null }
  },
  select: {
    completedAt: true
  }
});

const timelineMap: Record<string, number> = {};

timelineRaw.forEach((item) => {
  if (!item.completedAt) return;

  const isoString = item.completedAt.toISOString();
  const date = isoString.split("T")[0];

  if (!date) return; // <-- strict safety

  timelineMap[date] = (timelineMap[date] ?? 0) + 1;
});

const timeline = Object.entries(timelineMap).map(
  ([date, total]) => ({
    date,
    total
  })
);

  // =============================
  // FAILED TEST CASE DETAILS
  // =============================

  const failedExecutions = await prisma.execution.findMany({
    where: {
      testRunId,
      overallResult: "FAIL"
    },
    include: {
      testCase: true,
      executedBy: true
    }
  });

  const failedTestCases = failedExecutions.map((exec) => ({
    testCaseId: exec.testCase.testCaseId,
    title: exec.testCase.title,
    executedBy: exec.executedBy.email,
    completedAt: exec.completedAt
  }));

  return {
    testRun: {
      id: testRun.id,
      name: testRun.name,
      startDate: testRun.startDate,
      endDate: testRun.endDate
    },
    summary: {
      totalExecuted,
      passed,
      failed,
      blocked,
      skipped,
      passRate
    },
    executionByTester,
    executionByModule,
    timeline,
    failedTestCases
  };
}