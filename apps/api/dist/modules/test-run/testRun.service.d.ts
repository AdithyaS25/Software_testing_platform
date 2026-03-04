export declare const createTestRunService: (projectId: string, name: string, description: string | undefined, startDate: Date, endDate: Date, testCaseIds: string[], createdById: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    projectId: string;
    status: import("@prisma/client").$Enums.TestRunStatus;
    startDate: Date;
    endDate: Date;
    createdById: string;
}>;
export declare const getAllTestRunsService: (projectId: string) => Promise<({
    testCases: ({
        testCase: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.TestCaseType;
            description: string;
            projectId: string;
            status: import("@prisma/client").$Enums.TestCaseStatus;
            createdById: string;
            testCaseId: string;
            module: string;
            title: string;
            priority: import("@prisma/client").$Enums.TestCasePriority;
            severity: import("@prisma/client").$Enums.TestCaseSeverity;
            preConditions: string | null;
            testDataRequirements: string | null;
            environmentRequirements: string | null;
            postConditions: string | null;
            cleanupSteps: string | null;
            estimatedDuration: number | null;
            automationStatus: import("@prisma/client").$Enums.AutomationStatus;
            automationScriptLink: string | null;
            tags: string[];
            version: number;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.TestRunCaseStatus;
        testRunId: string;
        testCaseId: string;
        assignedToId: string | null;
    })[];
    createdBy: {
        id: string;
        email: string;
        passwordHash: string;
        failedLoginAttempts: number;
        lockUntil: Date | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    projectId: string;
    status: import("@prisma/client").$Enums.TestRunStatus;
    startDate: Date;
    endDate: Date;
    createdById: string;
})[]>;
export declare const getTestRunByIdService: (projectId: string, id: string) => Promise<({
    testCases: ({
        testCase: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.TestCaseType;
            description: string;
            projectId: string;
            status: import("@prisma/client").$Enums.TestCaseStatus;
            createdById: string;
            testCaseId: string;
            module: string;
            title: string;
            priority: import("@prisma/client").$Enums.TestCasePriority;
            severity: import("@prisma/client").$Enums.TestCaseSeverity;
            preConditions: string | null;
            testDataRequirements: string | null;
            environmentRequirements: string | null;
            postConditions: string | null;
            cleanupSteps: string | null;
            estimatedDuration: number | null;
            automationStatus: import("@prisma/client").$Enums.AutomationStatus;
            automationScriptLink: string | null;
            tags: string[];
            version: number;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.TestRunCaseStatus;
        testRunId: string;
        testCaseId: string;
        assignedToId: string | null;
    })[];
    createdBy: {
        id: string;
        email: string;
        passwordHash: string;
        failedLoginAttempts: number;
        lockUntil: Date | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    projectId: string;
    status: import("@prisma/client").$Enums.TestRunStatus;
    startDate: Date;
    endDate: Date;
    createdById: string;
}) | null>;
export declare const assignTestRunCaseService: (testRunTestCaseId: string, assignedToId: string) => Promise<{
    id: string;
    status: import("@prisma/client").$Enums.TestRunCaseStatus;
    testRunId: string;
    testCaseId: string;
    assignedToId: string | null;
}>;
//# sourceMappingURL=testRun.service.d.ts.map