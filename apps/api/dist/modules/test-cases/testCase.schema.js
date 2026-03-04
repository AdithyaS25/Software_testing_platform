"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTestCaseSchema = exports.listTestCasesQuerySchema = exports.createTestCaseSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const urlOrEmpty = zod_1.z.string().optional().transform(v => v === "" ? undefined : v).pipe(zod_1.z.string().url().optional());
exports.createTestCaseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    projectId: zod_1.z.string().cuid().optional(),
    description: zod_1.z.string().optional(),
    module: zod_1.z.string().min(1),
    priority: zod_1.z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
    severity: zod_1.z.enum(["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "TRIVIAL"]),
    type: zod_1.z.enum(["FUNCTIONAL", "REGRESSION", "SMOKE", "INTEGRATION", "UAT", "PERFORMANCE", "SECURITY", "USABILITY"]),
    status: zod_1.z.enum(["DRAFT", "READY_FOR_REVIEW", "APPROVED", "DEPRECATED", "ARCHIVED"]),
    preConditions: zod_1.z.string().optional(),
    testDataRequirements: zod_1.z.string().optional(),
    environmentRequirements: zod_1.z.string().optional(),
    postConditions: zod_1.z.string().optional(),
    cleanupSteps: zod_1.z.string().optional(),
    estimatedDuration: zod_1.z.number().int().positive().optional(),
    automationStatus: zod_1.z.enum(["NOT_AUTOMATED", "IN_PROGRESS", "AUTOMATED", "CANNOT_AUTOMATE"]),
    automationScriptLink: urlOrEmpty,
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    steps: zod_1.z.array(zod_1.z.object({
        stepNumber: zod_1.z.number().int().positive(),
        action: zod_1.z.string().min(1),
        testData: zod_1.z.string().optional(),
        expectedResult: zod_1.z.string().min(1),
    })).min(1),
});
exports.listTestCasesQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(50).default(10),
    status: zod_1.z.nativeEnum(client_1.TestCaseStatus).optional(),
    priority: zod_1.z.nativeEnum(client_1.TestCasePriority).optional(),
    module: zod_1.z.string().min(1).optional(),
    search: zod_1.z.string().min(1).optional(),
});
exports.updateTestCaseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().min(1).optional(),
    module: zod_1.z.string().min(1).optional(),
    priority: zod_1.z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
    severity: zod_1.z.enum(["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "TRIVIAL"]).optional(),
    type: zod_1.z.enum(["FUNCTIONAL", "REGRESSION", "SMOKE", "INTEGRATION", "UAT", "PERFORMANCE", "SECURITY", "USABILITY"]).optional(),
    status: zod_1.z.enum(["DRAFT", "READY_FOR_REVIEW", "APPROVED", "DEPRECATED", "ARCHIVED"]).optional(),
    preConditions: zod_1.z.string().optional(),
    testDataRequirements: zod_1.z.string().optional(),
    environmentRequirements: zod_1.z.string().optional(),
    postConditions: zod_1.z.string().optional(),
    cleanupSteps: zod_1.z.string().optional(),
    estimatedDuration: zod_1.z.number().int().positive().optional(),
    automationStatus: zod_1.z.enum(["NOT_AUTOMATED", "IN_PROGRESS", "AUTOMATED", "CANNOT_AUTOMATE"]).optional(),
    automationScriptLink: urlOrEmpty,
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    steps: zod_1.z.array(zod_1.z.object({
        stepNumber: zod_1.z.number().int().positive(),
        action: zod_1.z.string().min(1),
        testData: zod_1.z.string().optional(),
        expectedResult: zod_1.z.string().min(1),
    })).optional(),
});
//# sourceMappingURL=testCase.schema.js.map