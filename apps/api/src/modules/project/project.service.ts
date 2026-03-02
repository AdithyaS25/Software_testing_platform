// File: apps/api/src/modules/project/project.service.ts

import { prisma } from '../../prisma';
import { AppError } from '../../utils/errors'; // ← match YOUR existing AppError import path
import {
  CreateProjectInput,
  UpdateProjectInput,
  AddMembersInput,
  UpsertEnvironmentInput,
  UpsertCustomFieldInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  LinkTestRunsInput,
} from './project.schema';

const projectSelect = {
  id: true,
  name: true,
  description: true,
  key: true,
  status: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, email: true } },
  _count: {
    select: { testCases: true, bugs: true, testRuns: true, members: true },
  },
};

async function assertProjectAccess(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) throw new AppError('Project not found', 404);
  if (project.ownerId !== userId && !membership) {
    throw new AppError('You are not a member of this project', 403);
  }
  return project;
}

async function assertProjectOwner(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) throw new AppError('Project not found', 404);
  if (project.ownerId !== userId) {
    throw new AppError('Only the project owner can perform this action', 403);
  }
}

// ─── Projects ─────────────────────────────────────────────────

export async function createProject(userId: string, data: CreateProjectInput) {
  const existing = await prisma.project.findUnique({ where: { key: data.key } });
  if (existing) throw new AppError(`Project key "${data.key}" is already taken`, 409);

  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description ?? null,  // undefined → null
      key: data.key,
      ownerId: userId,
      members: {
        create: [
          { userId },
          ...(data.memberIds ?? [])
            .filter((id) => id !== userId)
            .map((id) => ({ userId: id })),
        ],
      },
    },
    select: projectSelect,
  });
}

export async function getAllProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: projectSelect,
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProjectById(projectId: string, userId: string) {
  await assertProjectAccess(projectId, userId);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, email: true, role: true } },
        },
      },
      environments: true,
      customFields: true,
      _count: { select: { testCases: true, bugs: true, testRuns: true, members: true } },
    },
  });

  if (!project) throw new AppError('Project not found', 404);
  return project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: UpdateProjectInput
) {
  await assertProjectOwner(projectId, userId);

  // Build update object only with defined fields (exactOptionalPropertyTypes fix)
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description ?? null;
  if (data.status !== undefined) updateData.status = data.status;

  return prisma.project.update({
    where: { id: projectId },
    data: updateData,
    select: projectSelect,
  });
}

export async function deleteProject(projectId: string, userId: string) {
  await assertProjectOwner(projectId, userId);
  return prisma.project.update({
    where: { id: projectId },
    data: { status: 'ARCHIVED' },
    select: { id: true, status: true },
  });
}

// ─── Members ─────────────────────────────────────────────────

export async function addMembers(projectId: string, userId: string, data: AddMembersInput) {
  await assertProjectOwner(projectId, userId);

  const users = await prisma.user.findMany({
    where: { id: { in: data.userIds } },
    select: { id: true },
  });
  if (users.length !== data.userIds.length) {
    throw new AppError('One or more user IDs are invalid', 400);
  }

  await prisma.projectMember.createMany({
    data: data.userIds.map((uid) => ({ projectId, userId: uid })),
    skipDuplicates: true,
  });

  return getProjectById(projectId, userId);
}

export async function removeMember(
  projectId: string,
  targetUserId: string,
  requesterId: string
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) throw new AppError('Project not found', 404);
  if (project.ownerId === targetUserId) throw new AppError('Cannot remove the project owner', 400);
  if (project.ownerId !== requesterId) throw new AppError('Only the project owner can remove members', 403);

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  });
  return { message: 'Member removed successfully' };
}

// ─── Environments ─────────────────────────────────────────────

export async function upsertEnvironment(
  projectId: string,
  userId: string,
  envId: string | undefined,
  data: UpsertEnvironmentInput
) {
  await assertProjectAccess(projectId, userId);

  const url = data.url ?? null; // undefined → null

  if (envId) {
    return prisma.projectEnvironment.update({
      where: { id: envId },
      data: { name: data.name, url },
    });
  }
  return prisma.projectEnvironment.create({
    data: { projectId, name: data.name, url },
  });
}

export async function deleteEnvironment(projectId: string, envId: string, userId: string) {
  await assertProjectAccess(projectId, userId);
  return prisma.projectEnvironment.delete({ where: { id: envId } });
}

// ─── Custom Fields ────────────────────────────────────────────

export async function upsertCustomField(
  projectId: string,
  userId: string,
  fieldId: string | undefined,
  data: UpsertCustomFieldInput
) {
  await assertProjectOwner(projectId, userId);

  const fieldData = {
    name: data.name,
    fieldType: data.fieldType,
    options: data.options ?? [],
    required: data.required ?? false,
  };

  if (fieldId) {
    return prisma.projectCustomField.update({ where: { id: fieldId }, data: fieldData });
  }
  return prisma.projectCustomField.create({ data: { projectId, ...fieldData } });
}

export async function deleteCustomField(projectId: string, fieldId: string, userId: string) {
  await assertProjectOwner(projectId, userId);
  return prisma.projectCustomField.delete({ where: { id: fieldId } });
}

// ─── Milestones ───────────────────────────────────────────────

async function computeMilestoneProgress(milestoneId: string) {
  const linked = await prisma.milestoneTestRun.findMany({
    where: { milestoneId },
    include: { testRun: { select: { id: true, name: true, status: true } } },
  });

  const total = linked.length;
  const completed = linked.filter((l) =>
    ['COMPLETED', 'PASSED', 'FAILED'].includes(l.testRun.status)
  ).length;

  const passRates: number[] = [];
  for (const entry of linked) {
    // fix: your model is 'execution' not 'testExecution'
    const executions = await prisma.execution.aggregate({
      where: { testRunId: entry.testRunId },
      _count: { id: true },
    });
    const passed = await prisma.execution.count({
      where: { testRunId: entry.testRunId, status: 'PASSED' },
    });
    if (executions._count.id > 0) {
      passRates.push((passed / executions._count.id) * 100);
    }
  }

  const avgPassRate =
    passRates.length > 0 ? passRates.reduce((a, b) => a + b, 0) / passRates.length : 0;

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    select: { passRateTarget: true },
  });

  return {
    totalTestRuns: total,
    completedTestRuns: completed,
    averagePassRate: Math.round(avgPassRate * 10) / 10,
    targetMet: milestone?.passRateTarget ? avgPassRate >= milestone.passRateTarget : false,
  };
}

export async function createMilestone(
  projectId: string,
  userId: string,
  data: CreateMilestoneInput
) {
  await assertProjectAccess(projectId, userId);

  const milestone = await prisma.milestone.create({
    data: {
      projectId,
      name: data.name,
      description: data.description ?? null,
      targetDate: new Date(data.targetDate),
      passRateTarget: data.passRateTarget ?? null,

      ...(data.testRunIds && data.testRunIds.length > 0 && {
        testRuns: {
          create: data.testRunIds.map((testRunId) => ({
            testRunId,
          })),
        },
      }),
    },
    include: {
      testRuns: {
        include: {
          testRun: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      },
    },
  });

  return milestone;
}

export async function getMilestones(projectId: string, userId: string) {
  await assertProjectAccess(projectId, userId);

  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    include: {
      testRuns: { include: { testRun: { select: { id: true, name: true, status: true } } } },
    },
    orderBy: { targetDate: 'asc' },
  });

  return Promise.all(
    milestones.map(async (m) => ({ ...m, progress: await computeMilestoneProgress(m.id) }))
  );
}

export async function getMilestoneById(
  projectId: string,
  milestoneId: string,
  userId: string
) {
  await assertProjectAccess(projectId, userId);

  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId, projectId },
    include: {
      testRuns: { include: { testRun: { select: { id: true, name: true, status: true } } } },
    },
  });

  if (!milestone) throw new AppError('Milestone not found', 404);
  const progress = await computeMilestoneProgress(milestoneId);
  return { ...milestone, progress };
}

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  userId: string,
  data: UpdateMilestoneInput
) {
  await assertProjectAccess(projectId, userId);

  const milestone = await prisma.milestone.findFirst({ where: { id: milestoneId, projectId } });
  if (!milestone) throw new AppError('Milestone not found', 404);

  // Build update object only with defined fields (exactOptionalPropertyTypes fix)
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description ?? null;
  if (data.targetDate !== undefined) updateData.targetDate = new Date(data.targetDate);
  if (data.passRateTarget !== undefined) updateData.passRateTarget = data.passRateTarget ?? null;
  if (data.status !== undefined) updateData.status = data.status;

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: updateData,
    include: {
      testRuns: { include: { testRun: { select: { id: true, name: true, status: true } } } },
    },
  });

  const progress = await computeMilestoneProgress(milestoneId);
  return { ...updated, progress };
}

export async function deleteMilestone(
  projectId: string,
  milestoneId: string,
  userId: string
) {
  await assertProjectAccess(projectId, userId);
  const milestone = await prisma.milestone.findFirst({ where: { id: milestoneId, projectId } });
  if (!milestone) throw new AppError('Milestone not found', 404);
  await prisma.milestone.delete({ where: { id: milestoneId } });
  return { message: 'Milestone deleted successfully' };
}

export async function linkTestRunsToMilestone(
  projectId: string,
  milestoneId: string,
  userId: string,
  data: LinkTestRunsInput
) {
  await assertProjectAccess(projectId, userId);

  const milestone = await prisma.milestone.findFirst({ where: { id: milestoneId, projectId } });
  if (!milestone) throw new AppError('Milestone not found', 404);

  const testRuns = await prisma.testRun.findMany({
    where: { id: { in: data.testRunIds }, projectId },
    select: { id: true },
  });
  if (testRuns.length !== data.testRunIds.length) {
    throw new AppError('One or more Test Runs do not belong to this project', 400);
  }

  await prisma.milestoneTestRun.createMany({
    data: data.testRunIds.map((testRunId) => ({ milestoneId, testRunId })),
    skipDuplicates: true,
  });

  return getMilestoneById(projectId, milestoneId, userId);
}

export async function unlinkTestRunFromMilestone(
  projectId: string,
  milestoneId: string,
  testRunId: string,
  userId: string
) {
  await assertProjectAccess(projectId, userId);
  await prisma.milestoneTestRun.delete({
    where: { milestoneId_testRunId: { milestoneId, testRunId } },
  });
  return getMilestoneById(projectId, milestoneId, userId);
}
