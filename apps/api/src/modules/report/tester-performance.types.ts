export interface TesterPerformanceReport {
  testers: {
    testerId: string;
    testerEmail: string;
    totalExecutions: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    passRate: number;
    averageExecutionMinutes: number;
    bugsRaised: number;
  }[];
}
