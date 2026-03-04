"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBug = createBug;
exports.listBugs = listBugs;
exports.listMyBugs = listMyBugs;
exports.getBugById = getBugById;
exports.updateBugStatus = updateBugStatus;
exports.assignBug = assignBug;
exports.addBugComment = addBugComment;
exports.deleteBugComment = deleteBugComment;
// File: apps/api/src/modules/bug/bug.service.ts
const prisma_1 = require("../../prisma");
const client_1 = require("@prisma/client");
/* ── ID Generation ──────────────────────────────────────── */
async function nextBugId() {
    const year = new Date().getFullYear();
    const prefix = `BUG-${year}-`;
    const last = await prisma_1.prisma.bug.findFirst({
        where: { bugId: { startsWith: prefix } },
        orderBy: { bugId: "desc" },
        select: { bugId: true },
    });
    let next = 1;
    if (last?.bugId) {
        const seq = parseInt(last.bugId.replace(prefix, ""), 10);
        if (!isNaN(seq))
            next = seq + 1;
    }
    return `${prefix}${next.toString().padStart(5, "0")}`;
}
/* ── Create Bug ─────────────────────────────────────────── */
async function createBug(projectId, data, userId) {
    const bugId = await nextBugId();
    return prisma_1.prisma.bug.create({
        data: {
            bugId,
            projectId,
            title: data.title,
            description: data.description,
            stepsToReproduce: data.stepsToReproduce ?? null,
            expectedBehavior: data.expectedBehavior,
            actualBehavior: data.actualBehavior,
            severity: data.severity,
            priority: data.priority,
            environment: data.environment ?? null,
            affectedVersion: data.affectedVersion ?? null,
            assignedToId: data.assignedToId ?? null,
            testCaseId: data.testCaseId ?? null,
            executionId: data.executionId ?? null,
            status: client_1.BugStatus.NEW,
        },
        include: { assignedTo: { select: { id: true, email: true } } },
    });
}
/* ── List Bugs ──────────────────────────────────────────── */
async function listBugs(projectId, filters) {
    const where = { projectId };
    if (filters.status)
        where.status = filters.status;
    if (filters.priority)
        where.priority = filters.priority;
    if (filters.severity)
        where.severity = filters.severity;
    return prisma_1.prisma.bug.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            assignedTo: { select: { id: true, email: true } },
            testCase: { select: { id: true, title: true, testCaseId: true } },
        },
    });
}
/* ── My Bugs (developer) ─────────────────────────────────── */
async function listMyBugs(projectId, userId, filters) {
    const where = { projectId, assignedToId: userId };
    if (filters.status)
        where.status = filters.status;
    if (filters.priority)
        where.priority = filters.priority;
    if (filters.severity)
        where.severity = filters.severity;
    return prisma_1.prisma.bug.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            assignedTo: { select: { id: true, email: true } },
            testCase: { select: { id: true, title: true, testCaseId: true } },
        },
    });
}
/* ── Get Bug by ID ──────────────────────────────────────── */
async function getBugById(projectId, bugId) {
    return prisma_1.prisma.bug.findFirst({
        where: { id: bugId, projectId },
        include: {
            assignedTo: { select: { id: true, email: true } },
            resolvedBy: { select: { id: true, email: true } },
            testCase: { select: { id: true, title: true, testCaseId: true } },
            comments: {
                include: { author: { select: { id: true, email: true } } },
                orderBy: { createdAt: "asc" },
            },
        },
    });
}
/* ── Update Status ──────────────────────────────────────── */
async function updateBugStatus(projectId, bugId, data, userId) {
    const bug = await prisma_1.prisma.bug.findFirst({ where: { id: bugId, projectId } });
    if (!bug)
        return null;
    const updateData = { status: data.status };
    if (data.fixNotes)
        updateData.fixNotes = data.fixNotes;
    if (["FIXED", "VERIFIED", "CLOSED"].includes(data.status)) {
        updateData.resolvedAt = new Date();
        updateData.resolvedById = userId;
    }
    return prisma_1.prisma.bug.update({
        where: { id: bugId },
        data: updateData,
        include: { assignedTo: { select: { id: true, email: true } } },
    });
}
/* ── Assign Bug ─────────────────────────────────────────── */
async function assignBug(projectId, bugId, data) {
    const bug = await prisma_1.prisma.bug.findFirst({ where: { id: bugId, projectId } });
    if (!bug)
        return null;
    return prisma_1.prisma.bug.update({
        where: { id: bugId },
        data: { assignedToId: data.assignedToId },
        include: { assignedTo: { select: { id: true, email: true } } },
    });
}
/* ── Add Comment ────────────────────────────────────────── */
async function addBugComment(projectId, bugId, data, userId) {
    const bug = await prisma_1.prisma.bug.findFirst({ where: { id: bugId, projectId } });
    if (!bug)
        return null;
    return prisma_1.prisma.bugComment.create({
        data: { bugId, authorId: userId, content: data.content },
        include: { author: { select: { id: true, email: true } } },
    });
}
/* ── Delete Comment ─────────────────────────────────────── */
async function deleteBugComment(commentId, userId) {
    const comment = await prisma_1.prisma.bugComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.authorId !== userId)
        return null;
    return prisma_1.prisma.bugComment.delete({ where: { id: commentId } });
}
//# sourceMappingURL=bug.service.js.map