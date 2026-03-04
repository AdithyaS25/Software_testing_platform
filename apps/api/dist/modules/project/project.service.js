"use strict";
// File: apps/api/src/modules/project/project.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.getAllProjects = getAllProjects;
exports.getProjectById = getProjectById;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.addMembers = addMembers;
exports.removeMember = removeMember;
exports.upsertEnvironment = upsertEnvironment;
exports.deleteEnvironment = deleteEnvironment;
exports.upsertCustomField = upsertCustomField;
exports.deleteCustomField = deleteCustomField;
exports.createMilestone = createMilestone;
exports.getMilestones = getMilestones;
exports.getMilestoneById = getMilestoneById;
exports.updateMilestone = updateMilestone;
exports.deleteMilestone = deleteMilestone;
exports.linkTestRunsToMilestone = linkTestRunsToMilestone;
exports.unlinkTestRunFromMilestone = unlinkTestRunFromMilestone;
const prisma_1 = require("../../prisma");
const errors_1 = require("../../utils/errors"); // ← match YOUR existing AppError import path
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
async function assertProjectAccess(projectId, userId) {
    const membership = await prisma_1.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
    });
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
    });
    if (!project)
        throw new errors_1.AppError('Project not found', 404);
    if (project.ownerId !== userId && !membership) {
        throw new errors_1.AppError('You are not a member of this project', 403);
    }
    return project;
}
async function assertProjectOwner(projectId, userId) {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
    });
    if (!project) {
        throw new Error('Project not found');
    }
    if (project.ownerId !== userId) {
        throw new Error('Forbidden: not owner'); // ← must say "forbidden" for controller catch to work
    }
}
// ─── Projects ─────────────────────────────────────────────────
async function createProject(userId, data) {
    const existing = await prisma_1.prisma.project.findUnique({ where: { key: data.key } });
    if (existing)
        throw new errors_1.AppError(`Project key "${data.key}" is already taken`, 409);
    return prisma_1.prisma.project.create({
        data: {
            name: data.name,
            description: data.description ?? null, // undefined → null
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
async function getAllProjects(userId) {
    return prisma_1.prisma.project.findMany({
        where: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        select: projectSelect,
        orderBy: { updatedAt: 'desc' },
    });
}
async function getProjectById(projectId, userId) {
    await assertProjectAccess(projectId, userId);
    const project = await prisma_1.prisma.project.findUnique({
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
    if (!project)
        throw new errors_1.AppError('Project not found', 404);
    return project;
}
async function updateProject(projectId, userId, data) {
    await assertProjectOwner(projectId, userId);
    // Build update object only with defined fields (exactOptionalPropertyTypes fix)
    const updateData = {};
    if (data.name !== undefined)
        updateData.name = data.name;
    if (data.description !== undefined)
        updateData.description = data.description ?? null;
    if (data.status !== undefined)
        updateData.status = data.status;
    return prisma_1.prisma.project.update({
        where: { id: projectId },
        data: updateData,
        select: projectSelect,
    });
}
async function deleteProject(projectId, userId) {
    await assertProjectOwner(projectId, userId);
    return prisma_1.prisma.project.delete({
        where: { id: projectId },
        select: { id: true },
    });
}
// ─── Members ─────────────────────────────────────────────────
async function addMembers(projectId, userId, data) {
    await assertProjectOwner(projectId, userId);
    const users = await prisma_1.prisma.user.findMany({
        where: { id: { in: data.userIds } },
        select: { id: true },
    });
    if (users.length !== data.userIds.length) {
        throw new errors_1.AppError('One or more user IDs are invalid', 400);
    }
    await prisma_1.prisma.projectMember.createMany({
        data: data.userIds.map((uid) => ({ projectId, userId: uid })),
        skipDuplicates: true,
    });
    return getProjectById(projectId, userId);
}
async function removeMember(projectId, targetUserId, requesterId) {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
    });
    if (!project)
        throw new errors_1.AppError('Project not found', 404);
    if (project.ownerId === targetUserId)
        throw new errors_1.AppError('Cannot remove the project owner', 400);
    if (project.ownerId !== requesterId)
        throw new errors_1.AppError('Only the project owner can remove members', 403);
    await prisma_1.prisma.projectMember.delete({
        where: { projectId_userId: { projectId, userId: targetUserId } },
    });
    return { message: 'Member removed successfully' };
}
// ─── Environments ─────────────────────────────────────────────
async function upsertEnvironment(projectId, userId, envId, data) {
    await assertProjectAccess(projectId, userId);
    const url = data.url ?? null; // undefined → null
    if (envId) {
        return prisma_1.prisma.projectEnvironment.update({
            where: { id: envId },
            data: { name: data.name, url },
        });
    }
    return prisma_1.prisma.projectEnvironment.create({
        data: { projectId, name: data.name, url },
    });
}
async function deleteEnvironment(projectId, envId, userId) {
    await assertProjectAccess(projectId, userId);
    return prisma_1.prisma.projectEnvironment.delete({ where: { id: envId } });
}
// ─── Custom Fields ────────────────────────────────────────────
async function upsertCustomField(projectId, userId, fieldId, data) {
    await assertProjectOwner(projectId, userId);
    const fieldData = {
        name: data.name,
        fieldType: data.fieldType,
        options: data.options ?? [],
        required: data.required ?? false,
    };
    if (fieldId) {
        return prisma_1.prisma.projectCustomField.update({ where: { id: fieldId }, data: fieldData });
    }
    return prisma_1.prisma.projectCustomField.create({ data: { projectId, ...fieldData } });
}
async function deleteCustomField(projectId, fieldId, userId) {
    await assertProjectOwner(projectId, userId);
    return prisma_1.prisma.projectCustomField.delete({ where: { id: fieldId } });
}
// ─── Milestones ───────────────────────────────────────────────
async function computeMilestoneProgress(milestoneId) {
    const linked = await prisma_1.prisma.milestoneTestRun.findMany({
        where: { milestoneId },
        include: { testRun: { select: { id: true, name: true, status: true } } },
    });
    const total = linked.length;
    const completed = linked.filter((l) => ['COMPLETED', 'PASSED', 'FAILED'].includes(l.testRun.status)).length;
    const passRates = [];
    for (const entry of linked) {
        // fix: your model is 'execution' not 'testExecution'
        const executions = await prisma_1.prisma.execution.aggregate({
            where: { testRunId: entry.testRunId },
            _count: { id: true },
        });
        const passed = await prisma_1.prisma.execution.count({
            where: { testRunId: entry.testRunId, status: 'PASSED' },
        });
        if (executions._count.id > 0) {
            passRates.push((passed / executions._count.id) * 100);
        }
    }
    const avgPassRate = passRates.length > 0 ? passRates.reduce((a, b) => a + b, 0) / passRates.length : 0;
    const milestone = await prisma_1.prisma.milestone.findUnique({
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
async function createMilestone(projectId, userId, data) {
    await assertProjectAccess(projectId, userId);
    const milestone = await prisma_1.prisma.milestone.create({
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
async function getMilestones(projectId, userId) {
    await assertProjectAccess(projectId, userId);
    const milestones = await prisma_1.prisma.milestone.findMany({
        where: { projectId },
        include: {
            testRuns: { include: { testRun: { select: { id: true, name: true, status: true } } } },
        },
        orderBy: { targetDate: 'asc' },
    });
    return Promise.all(milestones.map(async (m) => ({ ...m, progress: await computeMilestoneProgress(m.id) })));
}
async function getMilestoneById(projectId, milestoneId, userId) {
    await assertProjectAccess(projectId, userId);
    const milestone = await prisma_1.prisma.milestone.findFirst({
        where: { id: milestoneId, projectId },
        include: {
            testRuns: { include: { testRun: { select: { id: true, name: true, status: true } } } },
        },
    });
    if (!milestone)
        throw new errors_1.AppError('Milestone not found', 404);
    const progress = await computeMilestoneProgress(milestoneId);
    return { ...milestone, progress };
}
async function updateMilestone(projectId, milestoneId, userId, data) {
    await assertProjectAccess(projectId, userId);
    const milestone = await prisma_1.prisma.milestone.findFirst({ where: { id: milestoneId, projectId } });
    if (!milestone)
        throw new errors_1.AppError('Milestone not found', 404);
    // Build update object only with defined fields (exactOptionalPropertyTypes fix)
    const updateData = {};
    if (data.name !== undefined)
        updateData.name = data.name;
    if (data.description !== undefined)
        updateData.description = data.description ?? null;
    if (data.targetDate !== undefined)
        updateData.targetDate = new Date(data.targetDate);
    if (data.passRateTarget !== undefined)
        updateData.passRateTarget = data.passRateTarget ?? null;
    if (data.status !== undefined)
        updateData.status = data.status;
    const updated = await prisma_1.prisma.milestone.update({
        where: { id: milestoneId },
        data: updateData,
        include: {
            testRuns: { include: { testRun: { select: { id: true, name: true, status: true } } } },
        },
    });
    const progress = await computeMilestoneProgress(milestoneId);
    return { ...updated, progress };
}
async function deleteMilestone(projectId, milestoneId, userId) {
    await assertProjectAccess(projectId, userId);
    const milestone = await prisma_1.prisma.milestone.findFirst({ where: { id: milestoneId, projectId } });
    if (!milestone)
        throw new errors_1.AppError('Milestone not found', 404);
    await prisma_1.prisma.milestone.delete({ where: { id: milestoneId } });
    return { message: 'Milestone deleted successfully' };
}
async function linkTestRunsToMilestone(projectId, milestoneId, userId, data) {
    await assertProjectAccess(projectId, userId);
    const milestone = await prisma_1.prisma.milestone.findFirst({ where: { id: milestoneId, projectId } });
    if (!milestone)
        throw new errors_1.AppError('Milestone not found', 404);
    const testRuns = await prisma_1.prisma.testRun.findMany({
        where: { id: { in: data.testRunIds }, projectId },
        select: { id: true },
    });
    if (testRuns.length !== data.testRunIds.length) {
        throw new errors_1.AppError('One or more Test Runs do not belong to this project', 400);
    }
    await prisma_1.prisma.milestoneTestRun.createMany({
        data: data.testRunIds.map((testRunId) => ({ milestoneId, testRunId })),
        skipDuplicates: true,
    });
    return getMilestoneById(projectId, milestoneId, userId);
}
async function unlinkTestRunFromMilestone(projectId, milestoneId, testRunId, userId) {
    await assertProjectAccess(projectId, userId);
    await prisma_1.prisma.milestoneTestRun.delete({
        where: { milestoneId_testRunId: { milestoneId, testRunId } },
    });
    return getMilestoneById(projectId, milestoneId, userId);
}
//# sourceMappingURL=project.service.js.map