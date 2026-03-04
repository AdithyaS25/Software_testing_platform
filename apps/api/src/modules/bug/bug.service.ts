// File: apps/api/src/modules/bug/bug.service.ts
import { prisma } from "../../prisma";
import { CreateBugInput, UpdateBugStatusInput, AssignBugInput, CreateBugCommentInput } from "./bug.schema";
import { BugStatus } from "@prisma/client";

/* ── ID Generation ──────────────────────────────────────── */
async function nextBugId(): Promise<string> {
  const year   = new Date().getFullYear();
  const prefix = `BUG-${year}-`;

  const last = await prisma.bug.findFirst({
    where:   { bugId: { startsWith: prefix } },
    orderBy: { bugId: "desc" },
    select:  { bugId: true },
  });

  let next = 1;
  if (last?.bugId) {
    const seq = parseInt(last.bugId.replace(prefix, ""), 10);
    if (!isNaN(seq)) next = seq + 1;
  }

  return `${prefix}${next.toString().padStart(5, "0")}`;
}

/* ── Create Bug ─────────────────────────────────────────── */
export async function createBug(projectId: string, data: CreateBugInput, userId: string) {
  const bugId = await nextBugId();

  return prisma.bug.create({
    data: {
      bugId,
      projectId,
      title:            data.title,
      description:      data.description,
      stepsToReproduce: data.stepsToReproduce ?? null,
      expectedBehavior: data.expectedBehavior,
      actualBehavior:   data.actualBehavior,
      severity:         data.severity as any,
      priority:         data.priority as any,
      environment:      data.environment      ?? null,
      affectedVersion:  data.affectedVersion  ?? null,
      assignedToId:     data.assignedToId     ?? null,
      testCaseId:       data.testCaseId       ?? null,
      executionId:      data.executionId      ?? null,
      status:           BugStatus.NEW,
    },
    include: { assignedTo: { select: { id: true, email: true } } },
  });
}

/* ── List Bugs ──────────────────────────────────────────── */
export async function listBugs(projectId: string, filters: {
  status?: string; priority?: string; severity?: string;
}) {
  const where: any = { projectId };
  if (filters.status)   where.status   = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.severity) where.severity = filters.severity;

  return prisma.bug.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: { select: { id: true, email: true } },
      testCase:   { select: { id: true, title: true, testCaseId: true } },
    },
  });
}

/* ── My Bugs (developer) ─────────────────────────────────── */
export async function listMyBugs(projectId: string, userId: string, filters: {
  status?: string; priority?: string; severity?: string;
}) {
  const where: any = { projectId, assignedToId: userId };
  if (filters.status)   where.status   = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.severity) where.severity = filters.severity;

  return prisma.bug.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: { select: { id: true, email: true } },
      testCase:   { select: { id: true, title: true, testCaseId: true } },
    },
  });
}

/* ── Get Bug by ID ──────────────────────────────────────── */
export async function getBugById(projectId: string, bugId: string) {
  return prisma.bug.findFirst({
    where: { id: bugId, projectId },
    include: {
      assignedTo: { select: { id: true, email: true } },
      resolvedBy: { select: { id: true, email: true } },
      testCase:   { select: { id: true, title: true, testCaseId: true } },
      comments: {
        include: { author: { select: { id: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

/* ── Update Status ──────────────────────────────────────── */
export async function updateBugStatus(
  projectId: string, bugId: string,
  data: UpdateBugStatusInput, userId: string
) {
  const bug = await prisma.bug.findFirst({ where: { id: bugId, projectId } });
  if (!bug) return null;

  const updateData: any = { status: data.status };
  if (data.fixNotes) updateData.fixNotes = data.fixNotes;

  if (["FIXED","VERIFIED","CLOSED"].includes(data.status)) {
    updateData.resolvedAt   = new Date();
    updateData.resolvedById = userId;
  }

  return prisma.bug.update({
    where:   { id: bugId },
    data:    updateData,
    include: { assignedTo: { select: { id: true, email: true } } },
  });
}

/* ── Assign Bug ─────────────────────────────────────────── */
export async function assignBug(projectId: string, bugId: string, data: AssignBugInput) {
  const bug = await prisma.bug.findFirst({ where: { id: bugId, projectId } });
  if (!bug) return null;
  return prisma.bug.update({
    where:   { id: bugId },
    data:    { assignedToId: data.assignedToId },
    include: { assignedTo: { select: { id: true, email: true } } },
  });
}

/* ── Add Comment ────────────────────────────────────────── */
export async function addBugComment(
  projectId: string, bugId: string,
  data: CreateBugCommentInput, userId: string
) {
  const bug = await prisma.bug.findFirst({ where: { id: bugId, projectId } });
  if (!bug) return null;
  return prisma.bugComment.create({
    data:    { bugId, authorId: userId, content: data.content },
    include: { author: { select: { id: true, email: true } } },
  });
}

/* ── Delete Comment ─────────────────────────────────────── */
export async function deleteBugComment(commentId: string, userId: string) {
  const comment = await prisma.bugComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== userId) return null;
  return prisma.bugComment.delete({ where: { id: commentId } });
}
