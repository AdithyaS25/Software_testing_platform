import { prisma } from "../../prisma";
import { generateTestExecutionReport } from "./report.service";

/* ============================
   EXPORT TEST EXECUTION CSV
============================ */

export async function exportTestExecutionCSV(
  projectId: string,
  testRunId: string
) {
  const report = await generateTestExecutionReport(
    projectId,
    testRunId
  );

  const rows = [
    [
      "Module",
      "Total Executed",
      "Failed",
      "Passed",
    ],
  ];

  report.executionByModule.forEach((item) => {
    const passed = item.total - item.failed;

    rows.push([
      item.module,
      item.total.toString(),
      item.failed.toString(),
      passed.toString(),
    ]);
  });

  return rows.map((row) => row.join(",")).join("\n");
}

/* ============================
   EXPORT BUG REPORT CSV
============================ */

export async function exportBugReportCSV(
  projectId: string
) {
  const bugs = await prisma.bug.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    [
      "Bug ID",
      "Title",
      "Status",
      "Priority",
      "Severity",
      "Created At",
    ],
  ];

  bugs.forEach((bug) => {
    rows.push([
      bug.bugId,
      bug.title,
      bug.status,
      bug.priority,
      bug.severity,
      bug.createdAt.toISOString(),
    ]);
  });

  return rows.map((row) => row.join(",")).join("\n");
}
