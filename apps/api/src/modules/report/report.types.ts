export interface TestExecutionReport {
  testRun: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalExecuted: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    passRate: number;
  };
  executionByTester: {
    testerId: string;
    testerEmail: string;
    total: number;
  }[];
  executionByModule: {
    module: string;
    total: number;
    failed: number;
  }[];
  timeline: {
    date: string;
    total: number;
  }[];
  failedTestCases: {
    testCaseId: string;
    title: string;
    executedBy: string;
    completedAt: Date | null;
  }[];
}