import { z } from "zod";
export declare const createTestCaseSchema: z.ZodObject<{
    title: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    module: z.ZodString;
    priority: z.ZodEnum<{
        CRITICAL: "CRITICAL";
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
    severity: z.ZodEnum<{
        CRITICAL: "CRITICAL";
        BLOCKER: "BLOCKER";
        MAJOR: "MAJOR";
        MINOR: "MINOR";
        TRIVIAL: "TRIVIAL";
    }>;
    type: z.ZodEnum<{
        FUNCTIONAL: "FUNCTIONAL";
        REGRESSION: "REGRESSION";
        SMOKE: "SMOKE";
        INTEGRATION: "INTEGRATION";
        UAT: "UAT";
        PERFORMANCE: "PERFORMANCE";
        SECURITY: "SECURITY";
        USABILITY: "USABILITY";
    }>;
    status: z.ZodEnum<{
        ARCHIVED: "ARCHIVED";
        DRAFT: "DRAFT";
        READY_FOR_REVIEW: "READY_FOR_REVIEW";
        APPROVED: "APPROVED";
        DEPRECATED: "DEPRECATED";
    }>;
    preConditions: z.ZodOptional<z.ZodString>;
    testDataRequirements: z.ZodOptional<z.ZodString>;
    environmentRequirements: z.ZodOptional<z.ZodString>;
    postConditions: z.ZodOptional<z.ZodString>;
    cleanupSteps: z.ZodOptional<z.ZodString>;
    estimatedDuration: z.ZodOptional<z.ZodNumber>;
    automationStatus: z.ZodEnum<{
        IN_PROGRESS: "IN_PROGRESS";
        NOT_AUTOMATED: "NOT_AUTOMATED";
        AUTOMATED: "AUTOMATED";
        CANNOT_AUTOMATE: "CANNOT_AUTOMATE";
    }>;
    automationScriptLink: z.ZodPipe<z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>, z.ZodOptional<z.ZodString>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    steps: z.ZodArray<z.ZodObject<{
        stepNumber: z.ZodNumber;
        action: z.ZodString;
        testData: z.ZodOptional<z.ZodString>;
        expectedResult: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;
export declare const listTestCasesQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        READY_FOR_REVIEW: "READY_FOR_REVIEW";
        APPROVED: "APPROVED";
        DEPRECATED: "DEPRECATED";
        ARCHIVED: "ARCHIVED";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        CRITICAL: "CRITICAL";
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>>;
    module: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ListTestCasesQuery = z.infer<typeof listTestCasesQuerySchema>;
export declare const updateTestCaseSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    module: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<{
        CRITICAL: "CRITICAL";
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>>;
    severity: z.ZodOptional<z.ZodEnum<{
        CRITICAL: "CRITICAL";
        BLOCKER: "BLOCKER";
        MAJOR: "MAJOR";
        MINOR: "MINOR";
        TRIVIAL: "TRIVIAL";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        FUNCTIONAL: "FUNCTIONAL";
        REGRESSION: "REGRESSION";
        SMOKE: "SMOKE";
        INTEGRATION: "INTEGRATION";
        UAT: "UAT";
        PERFORMANCE: "PERFORMANCE";
        SECURITY: "SECURITY";
        USABILITY: "USABILITY";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        ARCHIVED: "ARCHIVED";
        DRAFT: "DRAFT";
        READY_FOR_REVIEW: "READY_FOR_REVIEW";
        APPROVED: "APPROVED";
        DEPRECATED: "DEPRECATED";
    }>>;
    preConditions: z.ZodOptional<z.ZodString>;
    testDataRequirements: z.ZodOptional<z.ZodString>;
    environmentRequirements: z.ZodOptional<z.ZodString>;
    postConditions: z.ZodOptional<z.ZodString>;
    cleanupSteps: z.ZodOptional<z.ZodString>;
    estimatedDuration: z.ZodOptional<z.ZodNumber>;
    automationStatus: z.ZodOptional<z.ZodEnum<{
        IN_PROGRESS: "IN_PROGRESS";
        NOT_AUTOMATED: "NOT_AUTOMATED";
        AUTOMATED: "AUTOMATED";
        CANNOT_AUTOMATE: "CANNOT_AUTOMATE";
    }>>;
    automationScriptLink: z.ZodPipe<z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>, z.ZodOptional<z.ZodString>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
        stepNumber: z.ZodNumber;
        action: z.ZodString;
        testData: z.ZodOptional<z.ZodString>;
        expectedResult: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>;
//# sourceMappingURL=testCase.schema.d.ts.map