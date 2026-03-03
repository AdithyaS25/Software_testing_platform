// File: apps/api/src/modules/bug/bug.schema.ts
import { z } from "zod";

export const createBugSchema = z.object({
  title:            z.string().min(1).max(200),
  description:      z.string().min(1),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().min(1),
  actualBehavior:   z.string().min(1),
  severity:         z.enum(["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "TRIVIAL"]),
  priority:         z.enum(["P1_URGENT", "P2_HIGH", "P3_MEDIUM", "P4_LOW"]),
  environment:      z.string().optional(),
  affectedVersion:  z.string().optional(),
  assignedToId:     z.string().optional(),
  testCaseId:       z.string().optional(),
  executionId:      z.string().optional(),
});

export const updateBugStatusSchema = z.object({
  status:   z.enum(["NEW","OPEN","IN_PROGRESS","FIXED","VERIFIED","CLOSED","REOPENED","WONT_FIX","DUPLICATE"]),
  fixNotes: z.string().optional(),
});

export const assignBugSchema = z.object({
  assignedToId: z.string().min(1),
});

export const createBugCommentSchema = z.object({
  content: z.string().min(1),
});

export type CreateBugInput       = z.infer<typeof createBugSchema>;
export type UpdateBugStatusInput = z.infer<typeof updateBugStatusSchema>;
export type AssignBugInput       = z.infer<typeof assignBugSchema>;
export type CreateBugCommentInput = z.infer<typeof createBugCommentSchema>;
