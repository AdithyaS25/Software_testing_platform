import type { WidgetConfig } from "../types/widget.types";
import { SummaryCard } from "../widgets/SummaryCard";
import { ExecutionTrendChart } from "../widgets/ExecutionTrendChart";
import { BugTrendChart } from "../widgets/BugTrendChart";
import type { DashboardResponse } from "../types/dashboard.types";

interface Props {
  widget: WidgetConfig;
  data: DashboardResponse;
}

export const WidgetRenderer = ({ widget, data }: Props) => {
  const { summary, executionTrend, bugTrend } = data;

  switch (widget.type) {
    case "SUMMARY_TOTAL_RUNS":
      return (
        <SummaryCard
          title="Total Test Runs"
          value={summary.totalTestRuns}
        />
      );

    case "SUMMARY_TOTAL_EXECUTIONS":
      return (
        <SummaryCard
          title="Total Executions"
          value={summary.totalExecutions}
        />
      );

    case "SUMMARY_PASS_RATE":
      return (
        <SummaryCard
          title="Pass Rate (%)"
          value={summary.overallPassRate}
        />
      );

    case "SUMMARY_TOTAL_BUGS":
      return (
        <SummaryCard
          title="Total Bugs"
          value={summary.totalBugs}
        />
      );

    case "SUMMARY_OPEN_BUGS":
      return (
        <SummaryCard
          title="Open Bugs"
          value={summary.openBugs}
        />
      );

    case "SUMMARY_CRITICAL_BUGS":
      return (
        <SummaryCard
          title="Critical Bugs"
          value={summary.criticalBugs}
        />
      );

    case "CHART_EXECUTION_TREND":
      return <ExecutionTrendChart data={executionTrend} />;

    case "CHART_BUG_TREND":
      return <BugTrendChart data={bugTrend} />;

    default:
      return null;
  }
};
