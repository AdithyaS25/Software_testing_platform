export declare function generateBugReport(projectId: string): Promise<{
    summary: {
        total: number;
        byStatus: {
            status: import("@prisma/client").$Enums.BugStatus;
            count: number;
        }[];
        bySeverity: {
            severity: import("@prisma/client").$Enums.BugSeverity;
            count: number;
        }[];
        byPriority: {
            priority: import("@prisma/client").$Enums.BugPriority;
            count: number;
        }[];
    };
    aging: {
        averageDaysOpen: number;
        oldestOpenBugDays: number;
    };
    resolutionMetrics: {
        averageResolutionDays: number;
        fastestResolutionDays: number;
    };
    byDeveloper: {
        developerId: string | null;
        developerName: string;
        totalAssigned: number;
        totalFixed: number;
        avgResolutionDays: number;
    }[];
}>;
//# sourceMappingURL=bug-report.service.d.ts.map