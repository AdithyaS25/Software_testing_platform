// File: apps/api/src/modules/project/project.schema.ts

import { z } from 'zod';

const PROJECT_KEY_REGEX = /^[A-Z]{2,6}$/;

// ─────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(500).optional(),
    key: z
      .string()
      .regex(PROJECT_KEY_REGEX, 'Key must be 2–6 uppercase letters (e.g. TTP)'),
    memberIds: z.array(z.string().cuid()).optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({ projectId: z.string().cuid() }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Members
// ─────────────────────────────────────────────────────────────

export const addMembersSchema = z.object({
  params: z.object({ projectId: z.string().cuid() }),
  body: z.object({
    userIds: z.array(z.string().cuid()).min(1, 'At least one userId required'),
  }),
});

export const removeMemberParamSchema = z.object({
  params: z.object({
    projectId: z.string().cuid(),
    userId: z.string().cuid(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Environments
// ─────────────────────────────────────────────────────────────

export const upsertEnvironmentSchema = z.object({
  params: z.object({ projectId: z.string().cuid() }),
  body: z.object({
    name: z.string().min(1).max(50),
    url: z.string().url().optional().or(z.literal('')),
  }),
});

export const environmentParamSchema = z.object({
  params: z.object({
    projectId: z.string().cuid(),
    envId: z.string().cuid(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Custom Fields
// ─────────────────────────────────────────────────────────────

export const upsertCustomFieldSchema = z.object({
  params: z.object({ projectId: z.string().cuid() }),
  body: z.object({
    name: z.string().min(1).max(50),
    fieldType: z.enum(['TEXT', 'NUMBER', 'DROPDOWN', 'DATE', 'BOOLEAN']),
    options: z.array(z.string()).optional(),
    required: z.boolean().optional(),
  }),
});

export const customFieldParamSchema = z.object({
  params: z.object({
    projectId: z.string().cuid(),
    fieldId: z.string().cuid(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Milestones
// ─────────────────────────────────────────────────────────────

export const createMilestoneSchema = z.object({
  params: z.object({ projectId: z.string().cuid() }),
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    targetDate: z.string().datetime({ message: 'Invalid date format' }),
    passRateTarget: z.number().min(0).max(100).optional(),
    testRunIds: z.array(z.string().cuid()).optional(),
  }),
});

export const updateMilestoneSchema = z.object({
  params: z.object({
    projectId: z.string().cuid(),
    milestoneId: z.string().cuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    targetDate: z.string().datetime().optional(),
    passRateTarget: z.number().min(0).max(100).optional(),
    status: z
      .enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'MISSED'])
      .optional(),
  }),
});

export const milestoneParamSchema = z.object({
  params: z.object({
    projectId: z.string().cuid(),
    milestoneId: z.string().cuid(),
  }),
});

export const linkTestRunsSchema = z.object({
  params: z.object({
    projectId: z.string().cuid(),
    milestoneId: z.string().cuid(),
  }),
  body: z.object({
    testRunIds: z.array(z.string().cuid()).min(1),
  }),
});

export const unlinkTestRunParamSchema = z.object({
  params: z.object({
    projectId: z.string().cuid(),
    milestoneId: z.string().cuid(),
    testRunId: z.string().cuid(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Shared Param Schemas
// ─────────────────────────────────────────────────────────────

export const projectIdParamSchema = z.object({
  params: z.object({
    projectId: z.string().cuid(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
export type AddMembersInput = z.infer<typeof addMembersSchema>['body'];
export type UpsertEnvironmentInput = z.infer<typeof upsertEnvironmentSchema>['body'];
export type UpsertCustomFieldInput = z.infer<typeof upsertCustomFieldSchema>['body'];
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>['body'];
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>['body'];
export type LinkTestRunsInput = z.infer<typeof linkTestRunsSchema>['body'];
