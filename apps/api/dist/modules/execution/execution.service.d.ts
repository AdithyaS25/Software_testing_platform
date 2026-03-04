import { ExecutionStatus } from "@prisma/client";
export declare const createExecutionService: (testCaseId: string, testRunId: string, userId: string) => Promise<{
    steps: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.StepStatus | null;
        executionId: string;
        stepNumber: number;
        action: string;
        expectedResult: string;
        actualResult: string | null;
        notes: string | null;
        evidenceUrl: string | null;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import("@prisma/client").$Enums.ExecutionStatus;
    testRunId: string | null;
    testCaseId: string;
    executedById: string;
    overallResult: import("@prisma/client").$Enums.StepStatus | null;
    startedAt: Date;
    completedAt: Date | null;
    suiteExecutionId: string | null;
}>;
export declare const updateExecutionService: (executionId: string, payload: {
    status?: ExecutionStatus;
    steps?: {
        id: string;
        status?: "PASS" | "FAIL" | "BLOCKED" | "SKIPPED";
        actualResult?: string;
        notes?: string;
    }[];
}) => Promise<({
    steps: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.StepStatus | null;
        executionId: string;
        stepNumber: number;
        action: string;
        expectedResult: string;
        actualResult: string | null;
        notes: string | null;
        evidenceUrl: string | null;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import("@prisma/client").$Enums.ExecutionStatus;
    testRunId: string | null;
    testCaseId: string;
    executedById: string;
    overallResult: import("@prisma/client").$Enums.StepStatus | null;
    startedAt: Date;
    completedAt: Date | null;
    suiteExecutionId: string | null;
}) | null>;
export declare const completeExecutionService: (executionId: string) => Promise<{
    steps: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.StepStatus | null;
        executionId: string;
        stepNumber: number;
        action: string;
        expectedResult: string;
        actualResult: string | null;
        notes: string | null;
        evidenceUrl: string | null;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import("@prisma/client").$Enums.ExecutionStatus;
    testRunId: string | null;
    testCaseId: string;
    executedById: string;
    overallResult: import("@prisma/client").$Enums.StepStatus | null;
    startedAt: Date;
    completedAt: Date | null;
    suiteExecutionId: string | null;
}>;
//# sourceMappingURL=execution.service.d.ts.map