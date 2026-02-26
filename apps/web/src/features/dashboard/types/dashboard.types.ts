export interface DashboardSummary {
  totalTestRuns: number;
  totalExecutions: number;
  overallPassRate: number;
  totalBugs: number;
  openBugs: number;
  criticalBugs: number;
}

export interface TrendPoint {
  date: string;
  total: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  executionTrend: TrendPoint[];
  bugTrend: TrendPoint[];
}
