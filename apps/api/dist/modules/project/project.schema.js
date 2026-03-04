"use strict";
// File: apps/api/src/modules/project/project.schema.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectIdParamSchema = exports.unlinkTestRunParamSchema = exports.linkTestRunsSchema = exports.milestoneParamSchema = exports.updateMilestoneSchema = exports.createMilestoneSchema = exports.customFieldParamSchema = exports.upsertCustomFieldSchema = exports.environmentParamSchema = exports.upsertEnvironmentSchema = exports.removeMemberParamSchema = exports.addMembersSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
const PROJECT_KEY_REGEX = /^[A-Z]{2,6}$/;
// ─────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────
exports.createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required').max(100),
        description: zod_1.z.string().max(500).optional(),
        key: zod_1.z
            .string()
            .regex(PROJECT_KEY_REGEX, 'Key must be 2–6 uppercase letters (e.g. TTP)'),
        memberIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
    }),
});
exports.updateProjectSchema = zod_1.z.object({
    params: zod_1.z.object({ projectId: zod_1.z.string().cuid() }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(500).optional(),
        status: zod_1.z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
    }),
});
// ─────────────────────────────────────────────────────────────
// Members
// ─────────────────────────────────────────────────────────────
exports.addMembersSchema = zod_1.z.object({
    params: zod_1.z.object({ projectId: zod_1.z.string().cuid() }),
    body: zod_1.z.object({
        userIds: zod_1.z.array(zod_1.z.string().cuid()).min(1, 'At least one userId required'),
    }),
});
exports.removeMemberParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.string().cuid(),
        userId: zod_1.z.string().cuid(),
    }),
});
// ─────────────────────────────────────────────────────────────
// Environments
// ─────────────────────────────────────────────────────────────
exports.upsertEnvironmentSchema = zod_1.z.object({
    params: zod_1.z.object({ projectId: zod_1.z.string().cuid() }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(50),
        url: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    }),
});
exports.environmentParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.string().cuid(),
        envId: zod_1.z.string().cuid(),
    }),
});
// ─────────────────────────────────────────────────────────────
// Custom Fields
// ─────────────────────────────────────────────────────────────
exports.upsertCustomFieldSchema = zod_1.z.object({
    params: zod_1.z.object({ projectId: zod_1.z.string().cuid() }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(50),
        fieldType: zod_1.z.enum(['TEXT', 'NUMBER', 'DROPDOWN', 'DATE', 'BOOLEAN']),
        options: zod_1.z.array(zod_1.z.string()).optional(),
        required: zod_1.z.boolean().optional(),
    }),
});
exports.customFieldParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.string().cuid(),
        fieldId: zod_1.z.string().cuid(),
    }),
});
// ─────────────────────────────────────────────────────────────
// Milestones
// ─────────────────────────────────────────────────────────────
exports.createMilestoneSchema = zod_1.z.object({
    params: zod_1.z.object({ projectId: zod_1.z.string().cuid() }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        description: zod_1.z.string().max(500).optional(),
        targetDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
        passRateTarget: zod_1.z.number().min(0).max(100).optional(),
        testRunIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
    }),
});
exports.updateMilestoneSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.string().cuid(),
        milestoneId: zod_1.z.string().cuid(),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(500).optional(),
        targetDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }).optional(),
        passRateTarget: zod_1.z.number().min(0).max(100).optional(),
        status: zod_1.z
            .enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'MISSED'])
            .optional(),
    }),
});
exports.milestoneParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.string().cuid(),
        milestoneId: zod_1.z.string().cuid(),
    }),
});
exports.linkTestRunsSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.string().cuid(),
        milestoneId: zod_1.z.string().cuid(),
    }),
    body: zod_1.z.object({
        testRunIds: zod_1.z.array(zod_1.z.string().cuid()).min(1),
    }),
});
exports.unlinkTestRunParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.string().cuid(),
        milestoneId: zod_1.z.string().cuid(),
        testRunId: zod_1.z.string().cuid(),
    }),
});
// ─────────────────────────────────────────────────────────────
// Shared Param Schemas
// ─────────────────────────────────────────────────────────────
exports.projectIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.string().cuid(),
    }),
});
//# sourceMappingURL=project.schema.js.map