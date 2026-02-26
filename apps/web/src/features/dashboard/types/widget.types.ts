export type WidgetType =
  | "SUMMARY_TOTAL_RUNS"
  | "SUMMARY_TOTAL_EXECUTIONS"
  | "SUMMARY_PASS_RATE"
  | "SUMMARY_TOTAL_BUGS"
  | "SUMMARY_OPEN_BUGS"
  | "SUMMARY_CRITICAL_BUGS"
  | "CHART_EXECUTION_TREND"
  | "CHART_BUG_TREND";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  allowedRoles: ("ADMIN" | "TESTER" | "DEVELOPER")[];
}
