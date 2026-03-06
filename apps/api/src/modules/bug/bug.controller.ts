/// <reference path="../../types/express.d.ts" />
import { Request, Response } from "express";
import {
  createBugSchema, updateBugStatusSchema,
  assignBugSchema, createBugCommentSchema,
} from "./bug.schema";
import {
  createBug, listBugs, listMyBugs, getBugById,
  updateBugStatus, assignBug, addBugComment, deleteBugComment,
} from "./bug.service";
import {
  notifyBugAssigned,
  notifyBugStatusChanged,
  notifyCommentMention,
  notifyRetestRequested,
} from "../notification/notification.service";
import { prisma } from "../../prisma";

/* ── Create Bug ─────────────────────────────────────────── */
export async function createBugController(req: Request, res: Response) {
  const projectId = req.params.projectId as string;
  const userId    = req.user?.id!;

  const parsed = createBugSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.flatten() });
  }

  const bug = await createBug(projectId, parsed.data, userId);

  if (bug.assignedToId) {
    notifyBugAssigned({
      assignedToId: bug.assignedToId,
      bugId:        bug.bugId,
      bugTitle:     bug.title,
      projectId:    bug.projectId,
      internalId:   bug.id,
    }).catch(console.error);
  }

  return res.status(201).json({ success: true, data: bug });
}

/* ── List Bugs ──────────────────────────────────────────── */
export async function getBugsController(req: Request, res: Response) {
  const projectId = String(req.params.projectId);
  const q = req.query as Record<string, string | undefined>;
  const filters = {
    ...(q.status   ? { status:   q.status }   : {}),
    ...(q.priority ? { priority: q.priority } : {}),
    ...(q.severity ? { severity: q.severity } : {}),
  };
  const bugs = await listBugs(projectId, filters);
  return res.status(200).json({ success: true, data: bugs });
}

/* ── Update Status ──────────────────────────────────────── */
export async function updateBugStatusController(req: Request, res: Response) {
  const projectId = String(req.params.projectId);
  const id        = String(req.params.id);
  const userId    = req.user?.id!;

  const parsed = updateBugStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.flatten() });
  }

  // Fetch raw bug BEFORE update — plain findFirst with no include/select
  // gives us the full scalar Bug type (status, assignedToId, resolvedById etc.)
  // Bug model has NO createdById — reporter tracking doesn't exist on this schema
  const rawBugBefore        = await prisma.bug.findFirst({ where: { id, projectId } });
  const previousStatus      = rawBugBefore?.status      ?? "";
  const previousAssignedToId = rawBugBefore?.assignedToId ?? null;

  const bug = await updateBugStatus(projectId, id, parsed.data, userId);
  if (!bug) return res.status(404).json({ success: false, message: "Bug not found" });

  // Notify on status change — notify the person making the change + assignee
  if (bug.status !== previousStatus) {
    notifyBugStatusChanged({
      reporterId:   userId,              // person triggering the change
      assignedToId: bug.assignedToId ?? null,
      bugId:        bug.bugId,
      bugTitle:     bug.title,
      newStatus:    bug.status,
      projectId:    bug.projectId,
      internalId:   bug.id,
    }).catch(console.error);
  }

  // Re-test notification: when bug moves to FIXED, notify the current assignee
  // (Bug has no createdById — assignee is the closest proxy for "who should re-test")
  // If your workflow has a separate tester field in future, swap previousAssignedToId here
  if (bug.status === "FIXED" && previousStatus !== "FIXED" && previousAssignedToId) {
    notifyRetestRequested({
      testerId:   previousAssignedToId,  // notify whoever was assigned before fix
      bugId:      bug.bugId,
      bugTitle:   bug.title,
      projectId:  bug.projectId,
      internalId: bug.id,
    }).catch(console.error);
  }

  return res.status(200).json({ success: true, data: bug });
}

/* ── Assign Bug ─────────────────────────────────────────── */
export async function assignBugController(req: Request, res: Response) {
  const projectId = String(req.params.projectId);
  const id        = String(req.params.id);

  const parsed = assignBugSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.flatten() });
  }

  const rawBugBefore         = await prisma.bug.findFirst({ where: { id, projectId } });
  const previousAssignedToId = rawBugBefore?.assignedToId ?? null;

  const bug = await assignBug(projectId, id, parsed.data);
  if (!bug) return res.status(404).json({ success: false, message: "Bug not found" });

  if (bug.assignedToId && bug.assignedToId !== previousAssignedToId) {
    notifyBugAssigned({
      assignedToId: bug.assignedToId,
      bugId:        bug.bugId,
      bugTitle:     bug.title,
      projectId:    bug.projectId,
      internalId:   bug.id,
    }).catch(console.error);
  }

  return res.status(200).json({ success: true, data: bug });
}

/* ── Add Comment ────────────────────────────────────────── */
export async function addCommentController(req: Request, res: Response) {
  const projectId = String(req.params.projectId);
  const id        = String(req.params.id);
  const userId    = req.user?.id!;

  const parsed = createBugCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.flatten() });
  }

  const comment = await addBugComment(projectId, id, parsed.data, userId);
  if (!comment) return res.status(404).json({ success: false, message: "Bug not found" });

  // @mention detection
  const content      = parsed.data.content as string;
  const mentionRegex = /@([\w.+-]+@[\w.-]+\.[a-z]{2,})/gi;
  const matches      = [...content.matchAll(mentionRegex)].map((m) => m[1]);

  if (matches.length > 0) {
    const [author, bug] = await Promise.all([
      prisma.user.findFirst({ where: { id: userId }, select: { email: true } }),
      prisma.bug.findFirst({ where: { id, projectId } }),
    ]);

    if (author && bug) {
      for (const emailAddr of matches) {
        // Assert emailAddr as string — regex guarantees it is never undefined
        const mentioned = await prisma.user.findFirst({
          where: { email: emailAddr as string },
          select: { id: true },
        });
        if (mentioned && mentioned.id !== userId) {
          notifyCommentMention({
            mentionedUserId: mentioned.id,
            authorEmail:     author.email,
            bugId:           bug.bugId,
            bugTitle:        bug.title,
            projectId:       bug.projectId,
            internalId:      bug.id,
          }).catch(console.error);
        }
      }
    }
  }

  return res.status(201).json({ success: true, data: comment });
}

export async function getCommentsController(req: Request, res: Response) {
  const bugId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

  if (!bugId || !projectId) return res.status(400).json({ message: "Invalid parameters" });

  const comments = await prisma.bugComment.findMany({
    where: { bugId },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, email: true, role: true } },
    },
  });

  return res.status(200).json({ success: true, data: comments });
};

/* ── Delete Comment ─────────────────────────────────────── */
export async function deleteCommentController(req: Request, res: Response) {
  const id     = String(req.params.id);
  const userId = req.user?.id!;

  const comment = await deleteBugComment(id, userId);
  if (!comment) return res.status(404).json({ success: false, message: "Comment not found or unauthorized" });

  return res.status(200).json({ success: true, message: "Comment deleted" });
}

/* ── My Bugs ────────────────────────────────────────────── */
export async function getMyBugsController(req: Request, res: Response) {
  const projectId = String(req.params.projectId);
  const userId    = req.user?.id!;
  const q = req.query as Record<string, string | undefined>;
  const filters = {
    ...(q.status   ? { status:   q.status }   : {}),
    ...(q.priority ? { priority: q.priority } : {}),
    ...(q.severity ? { severity: q.severity } : {}),
  };
  const bugs = await listMyBugs(projectId, userId, filters);
  return res.status(200).json({ success: true, data: bugs });
}

/* ── Get Bug by ID ──────────────────────────────────────── */
export async function getBugByIdController(req: Request, res: Response) {
  const projectId = String(req.params.projectId);
  const id        = String(req.params.id);

  const bug = await getBugById(projectId, id);
  if (!bug) return res.status(404).json({ success: false, message: "Bug not found" });

  return res.status(200).json({ success: true, data: bug });
}
