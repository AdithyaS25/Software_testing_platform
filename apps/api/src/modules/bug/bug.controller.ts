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

/* ── Create Bug ─────────────────────────────────────────── */
export async function createBugController(req: Request, res: Response) {
  const projectId = req.params.projectId as string;
  const userId    = req.user?.id!;

  const parsed = createBugSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.flatten() });
  }

  const bug = await createBug(projectId, parsed.data, userId);
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
  const userId = req.user?.id!;

  const parsed = updateBugStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.flatten() });
  }

  const bug = await updateBugStatus(projectId, id, parsed.data, userId);
  if (!bug) return res.status(404).json({ success: false, message: "Bug not found" });

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

  const bug = await assignBug(projectId, id, parsed.data);
  if (!bug) return res.status(404).json({ success: false, message: "Bug not found" });

  return res.status(200).json({ success: true, data: bug });
}

/* ── Add Comment ────────────────────────────────────────── */
export async function addCommentController(req: Request, res: Response) {
  const projectId = String(req.params.projectId);
const id        = String(req.params.id);
  const userId = req.user?.id!;

  const parsed = createBugCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.flatten() });
  }

  const comment = await addBugComment(projectId, id, parsed.data, userId);
  if (!comment) return res.status(404).json({ success: false, message: "Bug not found" });

  return res.status(201).json({ success: true, data: comment });
}

/* ── Delete Comment ─────────────────────────────────────── */
export async function deleteCommentController(req: Request, res: Response) {
  const id     = String(req.params.id); // ← was: const { id } = req.params
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