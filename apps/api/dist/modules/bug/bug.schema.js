"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBugCommentSchema = exports.assignBugSchema = exports.updateBugStatusSchema = exports.createBugSchema = void 0;
// File: apps/api/src/modules/bug/bug.schema.ts
const zod_1 = require("zod");
exports.createBugSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().min(1),
    stepsToReproduce: zod_1.z.string().optional(),
    expectedBehavior: zod_1.z.string().min(1),
    actualBehavior: zod_1.z.string().min(1),
    severity: zod_1.z.enum(["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "TRIVIAL"]),
    priority: zod_1.z.enum(["P1_URGENT", "P2_HIGH", "P3_MEDIUM", "P4_LOW"]),
    environment: zod_1.z.string().optional(),
    affectedVersion: zod_1.z.string().optional(),
    assignedToId: zod_1.z.string().optional(),
    testCaseId: zod_1.z.string().optional(),
    executionId: zod_1.z.string().optional(),
});
exports.updateBugStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["NEW", "OPEN", "IN_PROGRESS", "FIXED", "VERIFIED", "CLOSED", "REOPENED", "WONT_FIX", "DUPLICATE"]),
    fixNotes: zod_1.z.string().optional(),
});
exports.assignBugSchema = zod_1.z.object({
    assignedToId: zod_1.z.string().min(1),
});
exports.createBugCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1),
});
//# sourceMappingURL=bug.schema.js.map