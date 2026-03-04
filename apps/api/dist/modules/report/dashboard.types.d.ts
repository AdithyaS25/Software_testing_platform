export interface DashboardReport {
    summary: {
        totalTestRuns: number;
        totalExecutions: number;
        overallPassRate: number;
        totalBugs: number;
        openBugs: number;
        criticalBugs: number;
    };
    executionTrend: {
        date: string;
        total: number;
    }[];
    bugTrend: {
        date: string;
        total: number;
    }[];
}
//# sourceMappingURL=dashboard.types.d.ts.map