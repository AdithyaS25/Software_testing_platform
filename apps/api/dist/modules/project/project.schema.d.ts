import { z } from 'zod';
export declare const createProjectSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        key: z.ZodString;
        memberIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateProjectSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            ACTIVE: "ACTIVE";
            ARCHIVED: "ARCHIVED";
            COMPLETED: "COMPLETED";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const addMembersSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        userIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const removeMemberParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
        userId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const upsertEnvironmentSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodString;
        url: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const environmentParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
        envId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const upsertCustomFieldSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodString;
        fieldType: z.ZodEnum<{
            TEXT: "TEXT";
            NUMBER: "NUMBER";
            DROPDOWN: "DROPDOWN";
            DATE: "DATE";
            BOOLEAN: "BOOLEAN";
        }>;
        options: z.ZodOptional<z.ZodArray<z.ZodString>>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const customFieldParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
        fieldId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createMilestoneSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        targetDate: z.ZodString;
        passRateTarget: z.ZodOptional<z.ZodNumber>;
        testRunIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateMilestoneSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
        milestoneId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        targetDate: z.ZodOptional<z.ZodString>;
        passRateTarget: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<{
            COMPLETED: "COMPLETED";
            UPCOMING: "UPCOMING";
            IN_PROGRESS: "IN_PROGRESS";
            MISSED: "MISSED";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const milestoneParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
        milestoneId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const linkTestRunsSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
        milestoneId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        testRunIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const unlinkTestRunParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
        milestoneId: z.ZodString;
        testRunId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const projectIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
export type AddMembersInput = z.infer<typeof addMembersSchema>['body'];
export type UpsertEnvironmentInput = z.infer<typeof upsertEnvironmentSchema>['body'];
export type UpsertCustomFieldInput = z.infer<typeof upsertCustomFieldSchema>['body'];
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>['body'];
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>['body'];
export type LinkTestRunsInput = z.infer<typeof linkTestRunsSchema>['body'];
//# sourceMappingURL=project.schema.d.ts.map