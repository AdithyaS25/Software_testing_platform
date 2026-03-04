import { z } from "zod";
export declare const createBugSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    stepsToReproduce: z.ZodOptional<z.ZodString>;
    expectedBehavior: z.ZodString;
    actualBehavior: z.ZodString;
    severity: z.ZodEnum<{
        CRITICAL: "CRITICAL";
        BLOCKER: "BLOCKER";
        MAJOR: "MAJOR";
        MINOR: "MINOR";
        TRIVIAL: "TRIVIAL";
    }>;
    priority: z.ZodEnum<{
        P1_URGENT: "P1_URGENT";
        P2_HIGH: "P2_HIGH";
        P3_MEDIUM: "P3_MEDIUM";
        P4_LOW: "P4_LOW";
    }>;
    environment: z.ZodOptional<z.ZodString>;
    affectedVersion: z.ZodOptional<z.ZodString>;
    assignedToId: z.ZodOptional<z.ZodString>;
    testCaseId: z.ZodOptional<z.ZodString>;
    executionId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateBugStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        IN_PROGRESS: "IN_PROGRESS";
        NEW: "NEW";
        OPEN: "OPEN";
        FIXED: "FIXED";
        VERIFIED: "VERIFIED";
        CLOSED: "CLOSED";
        REOPENED: "REOPENED";
        WONT_FIX: "WONT_FIX";
        DUPLICATE: "DUPLICATE";
    }>;
    fixNotes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const assignBugSchema: z.ZodObject<{
    assignedToId: z.ZodString;
}, z.core.$strip>;
export declare const createBugCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
export type CreateBugInput = z.infer<typeof createBugSchema>;
export type UpdateBugStatusInput = z.infer<typeof updateBugStatusSchema>;
export type AssignBugInput = z.infer<typeof assignBugSchema>;
export type CreateBugCommentInput = z.infer<typeof createBugCommentSchema>;
//# sourceMappingURL=bug.schema.d.ts.map