export interface BugReport {
  summary: {
    total: number;
    byStatus: { status: string; count: number }[];
    bySeverity: { severity: string; count: number }[];
    byPriority: { priority: string; count: number }[];
  };
  aging: {
    averageDaysOpen: number;
    oldestOpenBugDays: number;
  };
  byDeveloper: {
    developerId: string;
    developerEmail: string;
    totalAssigned: number;
  }[];
  trends: {
    date: string;
    totalCreated: number;
  }[];
  resolutionMetrics: {
    averageResolutionDays: number;
    fastestResolutionDays: number;
    slowestResolutionDays: number;
  };
}
