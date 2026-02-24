import { generateTestExecutionReport } from "./report.service";
import { generateBugReport } from "./bug-report.service";

function convertToCSV(headers: string[], rows: any[][]): string {
  const headerRow = headers.join(",");
  const dataRows = rows.map((row) =>
    row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

export const exportTestExecutionCSV = async (testRunId: string) => {
  const report = await generateTestExecutionReport(testRunId);

  const headers = [
    "Test Run Name",
    "Total Executed",
    "Passed",
    "Failed",
    "Blocked",
    "Skipped",
    "Pass Rate (%)"
  ];

  const rows = [
    [
      report.testRun.name,
      report.summary.totalExecuted,
      report.summary.passed,
      report.summary.failed,
      report.summary.blocked,
      report.summary.skipped,
      report.summary.passRate
    ]
  ];

  return convertToCSV(headers, rows);
};

export const exportBugReportCSV = async () => {
  const report = await generateBugReport();

  const headers = [
    "Total Bugs",
    "Average Days Open",
    "Oldest Open Bug (Days)"
  ];

  const rows = [
    [
      report.summary.total,
      report.aging.averageDaysOpen,
      report.aging.oldestOpenBugDays
    ]
  ];

  return convertToCSV(headers, rows);
};
