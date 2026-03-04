import { CreateBugInput, UpdateBugStatusInput, AssignBugInput, CreateBugCommentInput } from "./bug.schema";
export declare function createBug(projectId: string, data: CreateBugInput, userId: string): Promise<{
    assignedTo: {
        id: string;
        email: string;
    } | null;
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    projectId: string;
    status: import("@prisma/client").$Enums.BugStatus;
    testCaseId: string | null;
    title: string;
    priority: import("@prisma/client").$Enums.BugPriority;
    severity: import("@prisma/client").$Enums.BugSeverity;
    assignedToId: string | null;
    stepsToReproduce: string | null;
    expectedBehavior: string;
    actualBehavior: string;
    environment: string | null;
    affectedVersion: string | null;
    executionId: string | null;
    fixNotes: string | null;
    bugId: string;
    executionStepId: string | null;
    resolvedAt: Date | null;
    resolvedById: string | null;
}>;
export declare function listBugs(projectId: string, filters: {
    status?: string;
    priority?: string;
    severity?: string;
}): Promise<({
    testCase: {
        id: string;
        testCaseId: string;
        title: string;
    } | null;
    assignedTo: {
        id: string;
        email: string;
    } | null;
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    projectId: string;
    status: import("@prisma/client").$Enums.BugStatus;
    testCaseId: string | null;
    title: string;
    priority: import("@prisma/client").$Enums.BugPriority;
    severity: import("@prisma/client").$Enums.BugSeverity;
    assignedToId: string | null;
    stepsToReproduce: string | null;
    expectedBehavior: string;
    actualBehavior: string;
    environment: string | null;
    affectedVersion: string | null;
    executionId: string | null;
    fixNotes: string | null;
    bugId: string;
    executionStepId: string | null;
    resolvedAt: Date | null;
    resolvedById: string | null;
})[]>;
export declare function listMyBugs(projectId: string, userId: string, filters: {
    status?: string;
    priority?: string;
    severity?: string;
}): Promise<({
    testCase: {
        id: string;
        testCaseId: string;
        title: string;
    } | null;
    assignedTo: {
        id: string;
        email: string;
    } | null;
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    projectId: string;
    status: import("@prisma/client").$Enums.BugStatus;
    testCaseId: string | null;
    title: string;
    priority: import("@prisma/client").$Enums.BugPriority;
    severity: import("@prisma/client").$Enums.BugSeverity;
    assignedToId: string | null;
    stepsToReproduce: string | null;
    expectedBehavior: string;
    actualBehavior: string;
    environment: string | null;
    affectedVersion: string | null;
    executionId: string | null;
    fixNotes: string | null;
    bugId: string;
    executionStepId: string | null;
    resolvedAt: Date | null;
    resolvedById: string | null;
})[]>;
export declare function getBugById(projectId: string, bugId: string): Promise<({
    testCase: {
        id: string;
        testCaseId: string;
        title: string;
    } | null;
    assignedTo: {
        id: string;
        email: string;
    } | null;
    resolvedBy: {
        id: string;
        email: string;
    } | null;
    comments: ({
        author: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        bugId: string;
        authorId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    projectId: string;
    status: import("@prisma/client").$Enums.BugStatus;
    testCaseId: string | null;
    title: string;
    priority: import("@prisma/client").$Enums.BugPriority;
    severity: import("@prisma/client").$Enums.BugSeverity;
    assignedToId: string | null;
    stepsToReproduce: string | null;
    expectedBehavior: string;
    actualBehavior: string;
    environment: string | null;
    affectedVersion: string | null;
    executionId: string | null;
    fixNotes: string | null;
    bugId: string;
    executionStepId: string | null;
    resolvedAt: Date | null;
    resolvedById: string | null;
}) | null>;
export declare function updateBugStatus(projectId: string, bugId: string, data: UpdateBugStatusInput, userId: string): Promise<({
    assignedTo: {
        id: string;
        email: string;
    } | null;
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    projectId: string;
    status: import("@prisma/client").$Enums.BugStatus;
    testCaseId: string | null;
    title: string;
    priority: import("@prisma/client").$Enums.BugPriority;
    severity: import("@prisma/client").$Enums.BugSeverity;
    assignedToId: string | null;
    stepsToReproduce: string | null;
    expectedBehavior: string;
    actualBehavior: string;
    environment: string | null;
    affectedVersion: string | null;
    executionId: string | null;
    fixNotes: string | null;
    bugId: string;
    executionStepId: string | null;
    resolvedAt: Date | null;
    resolvedById: string | null;
}) | null>;
export declare function assignBug(projectId: string, bugId: string, data: AssignBugInput): Promise<({
    assignedTo: {
        id: string;
        email: string;
    } | null;
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    projectId: string;
    status: import("@prisma/client").$Enums.BugStatus;
    testCaseId: string | null;
    title: string;
    priority: import("@prisma/client").$Enums.BugPriority;
    severity: import("@prisma/client").$Enums.BugSeverity;
    assignedToId: string | null;
    stepsToReproduce: string | null;
    expectedBehavior: string;
    actualBehavior: string;
    environment: string | null;
    affectedVersion: string | null;
    executionId: string | null;
    fixNotes: string | null;
    bugId: string;
    executionStepId: string | null;
    resolvedAt: Date | null;
    resolvedById: string | null;
}) | null>;
export declare function addBugComment(projectId: string, bugId: string, data: CreateBugCommentInput, userId: string): Promise<({
    author: {
        id: string;
        email: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    bugId: string;
    authorId: string;
}) | null>;
export declare function deleteBugComment(commentId: string, userId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    bugId: string;
    authorId: string;
} | null>;
//# sourceMappingURL=bug.service.d.ts.map