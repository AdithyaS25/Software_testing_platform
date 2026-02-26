import type { WidgetConfig } from "../types/widget.types";

export const defaultWidgets: WidgetConfig[] = [
  {
    id: "runs",
    type: "SUMMARY_TOTAL_RUNS",
    allowedRoles: ["ADMIN"],
  },
  {
    id: "executions",
    type: "SUMMARY_TOTAL_EXECUTIONS",
    allowedRoles: ["ADMIN", "TESTER"],
  },
  {
    id: "passRate",
    type: "SUMMARY_PASS_RATE",
    allowedRoles: ["ADMIN", "TESTER"],
  },
  {
    id: "bugs",
    type: "SUMMARY_TOTAL_BUGS",
    allowedRoles: ["ADMIN", "DEVELOPER"],
  },
  {
    id: "openBugs",
    type: "SUMMARY_OPEN_BUGS",
    allowedRoles: ["ADMIN", "DEVELOPER"],
  },
  {
    id: "criticalBugs",
    type: "SUMMARY_CRITICAL_BUGS",
    allowedRoles: ["ADMIN"],
  },
  {
    id: "executionTrend",
    type: "CHART_EXECUTION_TREND",
    allowedRoles: ["ADMIN", "TESTER"],
  },
  {
    id: "bugTrend",
    type: "CHART_BUG_TREND",
    allowedRoles: ["ADMIN", "DEVELOPER"],
  },
];
