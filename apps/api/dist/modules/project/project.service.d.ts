import { CreateProjectInput, UpdateProjectInput, AddMembersInput, UpsertEnvironmentInput, UpsertCustomFieldInput, CreateMilestoneInput, UpdateMilestoneInput, LinkTestRunsInput } from './project.schema';
export declare function createProject(userId: string, data: CreateProjectInput): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    key: string;
    status: import("@prisma/client").$Enums.ProjectStatus;
    ownerId: string;
    owner: {
        id: string;
        email: string;
    };
    _count: {
        testCases: number;
        bugs: number;
        testRuns: number;
        members: number;
    };
}>;
export declare function getAllProjects(userId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    key: string;
    status: import("@prisma/client").$Enums.ProjectStatus;
    ownerId: string;
    owner: {
        id: string;
        email: string;
    };
    _count: {
        testCases: number;
        bugs: number;
        testRuns: number;
        members: number;
    };
}[]>;
export declare function getProjectById(projectId: string, userId: string): Promise<{
    customFields: {
        id: string;
        name: string;
        projectId: string;
        fieldType: import("@prisma/client").$Enums.CustomFieldType;
        options: string[];
        required: boolean;
    }[];
    environments: {
        id: string;
        name: string;
        projectId: string;
        url: string | null;
    }[];
    members: ({
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        userId: string;
        projectId: string;
        joinedAt: Date;
    })[];
    owner: {
        id: string;
        email: string;
    };
    _count: {
        testCases: number;
        bugs: number;
        testRuns: number;
        members: number;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    key: string;
    status: import("@prisma/client").$Enums.ProjectStatus;
    ownerId: string;
}>;
export declare function updateProject(projectId: string, userId: string, data: UpdateProjectInput): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    key: string;
    status: import("@prisma/client").$Enums.ProjectStatus;
    ownerId: string;
    owner: {
        id: string;
        email: string;
    };
    _count: {
        testCases: number;
        bugs: number;
        testRuns: number;
        members: number;
    };
}>;
export declare function deleteProject(projectId: string, userId: string): Promise<{
    id: string;
}>;
export declare function addMembers(projectId: string, userId: string, data: AddMembersInput): Promise<{
    customFields: {
        id: string;
        name: string;
        projectId: string;
        fieldType: import("@prisma/client").$Enums.CustomFieldType;
        options: string[];
        required: boolean;
    }[];
    environments: {
        id: string;
        name: string;
        projectId: string;
        url: string | null;
    }[];
    members: ({
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        userId: string;
        projectId: string;
        joinedAt: Date;
    })[];
    owner: {
        id: string;
        email: string;
    };
    _count: {
        testCases: number;
        bugs: number;
        testRuns: number;
        members: number;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    key: string;
    status: import("@prisma/client").$Enums.ProjectStatus;
    ownerId: string;
}>;
export declare function removeMember(projectId: string, targetUserId: string, requesterId: string): Promise<{
    message: string;
}>;
export declare function upsertEnvironment(projectId: string, userId: string, envId: string | undefined, data: UpsertEnvironmentInput): Promise<{
    id: string;
    name: string;
    projectId: string;
    url: string | null;
}>;
export declare function deleteEnvironment(projectId: string, envId: string, userId: string): Promise<{
    id: string;
    name: string;
    projectId: string;
    url: string | null;
}>;
export declare function upsertCustomField(projectId: string, userId: string, fieldId: string | undefined, data: UpsertCustomFieldInput): Promise<{
    id: string;
    name: string;
    projectId: string;
    fieldType: import("@prisma/client").$Enums.CustomFieldType;
    options: string[];
    required: boolean;
}>;
export declare function deleteCustomField(projectId: string, fieldId: string, userId: string): Promise<{
    id: string;
    name: string;
    projectId: string;
    fieldType: import("@prisma/client").$Enums.CustomFieldType;
    options: string[];
    required: boolean;
}>;
export declare function createMilestone(projectId: string, userId: string, data: CreateMilestoneInput): Promise<{
    testRuns: ({
        testRun: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.TestRunStatus;
        };
    } & {
        milestoneId: string;
        testRunId: string;
        linkedAt: Date;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    projectId: string;
    status: import("@prisma/client").$Enums.MilestoneStatus;
    targetDate: Date;
    passRateTarget: number | null;
}>;
export declare function getMilestones(projectId: string, userId: string): Promise<{
    progress: {
        totalTestRuns: number;
        completedTestRuns: number;
        averagePassRate: number;
        targetMet: boolean;
    };
    testRuns: ({
        testRun: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.TestRunStatus;
        };
    } & {
        milestoneId: string;
        testRunId: string;
        linkedAt: Date;
    })[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    projectId: string;
    status: import("@prisma/client").$Enums.MilestoneStatus;
    targetDate: Date;
    passRateTarget: number | null;
}[]>;
export declare function getMilestoneById(projectId: string, milestoneId: string, userId: string): Promise<{
    progress: {
        totalTestRuns: number;
        completedTestRuns: number;
        averagePassRate: number;
        targetMet: boolean;
    };
    testRuns: ({
        testRun: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.TestRunStatus;
        };
    } & {
        milestoneId: string;
        testRunId: string;
        linkedAt: Date;
    })[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    projectId: string;
    status: import("@prisma/client").$Enums.MilestoneStatus;
    targetDate: Date;
    passRateTarget: number | null;
}>;
export declare function updateMilestone(projectId: string, milestoneId: string, userId: string, data: UpdateMilestoneInput): Promise<{
    progress: {
        totalTestRuns: number;
        completedTestRuns: number;
        averagePassRate: number;
        targetMet: boolean;
    };
    testRuns: ({
        testRun: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.TestRunStatus;
        };
    } & {
        milestoneId: string;
        testRunId: string;
        linkedAt: Date;
    })[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    projectId: string;
    status: import("@prisma/client").$Enums.MilestoneStatus;
    targetDate: Date;
    passRateTarget: number | null;
}>;
export declare function deleteMilestone(projectId: string, milestoneId: string, userId: string): Promise<{
    message: string;
}>;
export declare function linkTestRunsToMilestone(projectId: string, milestoneId: string, userId: string, data: LinkTestRunsInput): Promise<{
    progress: {
        totalTestRuns: number;
        completedTestRuns: number;
        averagePassRate: number;
        targetMet: boolean;
    };
    testRuns: ({
        testRun: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.TestRunStatus;
        };
    } & {
        milestoneId: string;
        testRunId: string;
        linkedAt: Date;
    })[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    projectId: string;
    status: import("@prisma/client").$Enums.MilestoneStatus;
    targetDate: Date;
    passRateTarget: number | null;
}>;
export declare function unlinkTestRunFromMilestone(projectId: string, milestoneId: string, testRunId: string, userId: string): Promise<{
    progress: {
        totalTestRuns: number;
        completedTestRuns: number;
        averagePassRate: number;
        targetMet: boolean;
    };
    testRuns: ({
        testRun: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.TestRunStatus;
        };
    } & {
        milestoneId: string;
        testRunId: string;
        linkedAt: Date;
    })[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    projectId: string;
    status: import("@prisma/client").$Enums.MilestoneStatus;
    targetDate: Date;
    passRateTarget: number | null;
}>;
//# sourceMappingURL=project.service.d.ts.map