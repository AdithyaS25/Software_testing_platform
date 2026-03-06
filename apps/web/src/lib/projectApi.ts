// File: apps/web/src/lib/projectApi.ts

export const projectApi = (projectId: string) => ({
  testCases: `/api/projects/${projectId}/test-cases`,
  testSuites: `/api/projects/${projectId}/test-suites`,
  testRuns: `/api/projects/${projectId}/test-runs`,
  bugs: `/api/projects/${projectId}/bugs`,
  executions: `/api/projects/${projectId}/executions`,
  milestones: `/api/projects/${projectId}/milestones`,
  reports: {
    dashboard: `/api/projects/${projectId}/reports/dashboard`,
    bugs: `/api/projects/${projectId}/reports/bugs`, // JSON stats
    bugExport: `/api/projects/${projectId}/reports/export/bugs`, // CSV download
    testExecution: (testRunId: string) =>
      `/api/projects/${projectId}/reports/test-execution/${testRunId}`,
    exportExecution: (testRunId: string) =>
      `/api/projects/${projectId}/reports/export/test-execution/${testRunId}`,
  },
});
