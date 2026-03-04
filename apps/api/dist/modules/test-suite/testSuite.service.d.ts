import { SuiteExecutionMode } from "@prisma/client";
export declare const executeSuite: (projectId: string, suiteId: string, userId: string, executionMode: SuiteExecutionMode) => Promise<{
    id: string;
    createdAt: Date;
    status: import("@prisma/client").$Enums.SuiteExecutionStatus;
    executedById: string;
    startedAt: Date;
    completedAt: Date | null;
    executionMode: import("@prisma/client").$Enums.SuiteExecutionMode;
    totalTests: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    suiteId: string;
}>;
export declare const completeSuiteExecution: (suiteExecutionId: string) => Promise<{
    passRate: number;
    id: string;
    createdAt: Date;
    status: import("@prisma/client").$Enums.SuiteExecutionStatus;
    executedById: string;
    startedAt: Date;
    completedAt: Date | null;
    executionMode: import("@prisma/client").$Enums.SuiteExecutionMode;
    totalTests: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    suiteId: string;
}>;
export declare const getSuiteExecutionReport: (suiteExecutionId: string) => Promise<{
    suite: {
        id: string;
        name: string;
        module: string | null;
    };
    summary: {
        totalTests: number;
        passed: number;
        failed: number;
        blocked: number;
        skipped: number;
        status: import("@prisma/client").$Enums.SuiteExecutionStatus;
        startedAt: Date;
        completedAt: Date | null;
    };
    executions: {
        executionId: string;
        status: import("@prisma/client").$Enums.ExecutionStatus;
        testCase: {
            id: string;
            title: string;
            module: string;
        };
    }[];
}>;
//# sourceMappingURL=testSuite.service.d.ts.map