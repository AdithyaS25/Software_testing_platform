export interface DeveloperPerformanceReport {
  developers: {
    developerId: string;
    developerEmail: string;
    totalAssigned: number;
    totalResolved: number;
    openBugs: number;
    averageResolutionDays: number;
    fastestResolutionDays: number;
    slowestResolutionDays: number;
    resolutionRate: number; // %
  }[];
}