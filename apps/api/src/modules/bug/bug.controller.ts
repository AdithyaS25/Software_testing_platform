import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { AuthenticatedRequest } from "../../types/auth-request";
import { BugStatus, BugPriority, BugSeverity } from "@prisma/client";

/**
 * Allowed status transitions (workflow enforcement)
 */
const allowedTransitions: Record<string, string[]> = {
  NEW: ["OPEN", "WONT_FIX", "DUPLICATE"],
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["FIXED"],
  FIXED: ["VERIFIED", "REOPENED"],
  VERIFIED: ["CLOSED"],
  REOPENED: ["IN_PROGRESS"],
};

/**
 * Role-based status permissions
 */
const roleBasedTransitions: Record<string, string[]> = {
  TESTER: [
    "OPEN",
    "WONT_FIX",
    "DUPLICATE",
    "VERIFIED",
    "REOPENED",
    "CLOSED",
  ],
  DEVELOPER: [
    "IN_PROGRESS",
    "FIXED",
  ],
};

/**
 * FR-BUG-001 — Manual Bug Creation
 */
export const createBugController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const projectId = String(req.params.projectId);

    const {
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      severity,
      priority,
      environment,
      affectedVersion,
      assignedToId,
      testCaseId,
    } = req.body;

    if (
      !title ||
      !description ||
      !expectedBehavior ||
      !actualBehavior ||
      !severity ||
      !priority
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Project-scoped count
    const bugCount = await prisma.bug.count({
      where: { projectId },
    });

    const bugId = `BUG-${new Date().getFullYear()}-${String(
      bugCount + 1
    ).padStart(5, "0")}`;

    const bug = await prisma.bug.create({
      data: {
        bugId,
        title,
        description,
        stepsToReproduce,
        expectedBehavior,
        actualBehavior,
        severity,
        priority,
        status: BugStatus.NEW,
        environment,
        affectedVersion,
        projectId, // 🔥 REQUIRED

        ...(assignedToId && {
          assignedTo: { connect: { id: assignedToId } },
        }),

        ...(testCaseId && {
          testCase: { connect: { id: testCaseId } },
        }),
      },
    });

    return res.status(201).json(bug);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * FR-BUG-002 — Update Bug Status (Workflow + Role Enforcement)
 */
export const updateBugStatusController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const bugId = String(req.params.id);
    const { status, fixNotes } = req.body;
    const userRole = req.user?.role;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const bug = await prisma.bug.findUnique({
      where: { id: bugId },
    });

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    const currentStatus = bug.status;
    const allowed = allowedTransitions[currentStatus] || [];

    // 1️⃣ Validate workflow transition
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${currentStatus} to ${status}`,
      });
    }

    // 2️⃣ Validate role permission
    if (
      !userRole ||
      !roleBasedTransitions[userRole]?.includes(status)
    ) {
      return res.status(403).json({
        message: `Role ${userRole} not allowed to move bug to ${status}`,
      });
    }

    // 3️⃣ Require fix notes when marking FIXED
    if (status === "FIXED" && !fixNotes) {
      return res.status(400).json({
        message: "Fix notes are required when marking bug as FIXED",
      });
    }

    const updateData: any = {
  status: status as BugStatus,
};

if (status === "FIXED") {
  updateData.fixNotes = fixNotes;
  updateData.resolvedAt = new Date();
  updateData.resolvedById = req.user?.id;
}

const updatedBug = await prisma.bug.update({
  where: { id: bugId },
  data: updateData,
});

    return res.status(200).json(updatedBug);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const getMyBugsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const projectId = String(req.params.projectId);

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const bugs = await prisma.bug.findMany({
      where: {
        projectId,                                    // ← scoped to project
        ...(userId ? { assignedToId: userId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(bugs);
  } catch (error: unknown) {
    return res.status(500).json({ message: "Failed to fetch assigned bugs" });
  }
};

export const getBugsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const projectId = String(req.params.projectId);

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const { status, priority, severity, sortBy, order } = req.query;

    const where: any = { projectId };   // ← scoped to project

    if (status && Object.values(BugStatus).includes(status as BugStatus)) {
      where.status = status as BugStatus;
    }

    if (priority && Object.values(BugPriority).includes(priority as BugPriority)) {
      where.priority = priority as BugPriority;
    }

    if (severity && Object.values(BugSeverity).includes(severity as BugSeverity)) {
      where.severity = severity as BugSeverity;
    }

    const bugs = await prisma.bug.findMany({
      where,
      orderBy: sortBy
        ? { [String(sortBy)]: order === "asc" ? "asc" : "desc" }
        : { createdAt: "desc" },
    });

    return res.status(200).json(bugs);
  } catch (error: unknown) {
    return res.status(500).json({ message: "Failed to fetch bugs" });
  }
};

export const assignBugController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const bugId = String(req.params.id);
    const { assignedToId } = req.body;

    if (!assignedToId) {
      return res.status(400).json({
        message: "assignedToId is required",
      });
    }

    // Ensure bug exists
    const bug = await prisma.bug.findUnique({
      where: { id: bugId },
    });

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    // Ensure user exists and is DEVELOPER
    const user = await prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!user || user.role !== "DEVELOPER") {
      return res.status(400).json({
        message: "Assigned user must be a DEVELOPER",
      });
    }

    const updatedBug = await prisma.bug.update({
      where: { id: bugId },
      data: {
        assignedToId,
      },
    });

    return res.status(200).json(updatedBug);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Failed to assign bug",
    });
  }
};

export const addBugCommentController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const bugId = String(req.params.id);
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    const bug = await prisma.bug.findUnique({
      where: { id: bugId },
    });

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    const comment = await prisma.bugComment.create({
      data: {
        content,
        bugId,
        authorId: req.user!.id,
      },
    });

    return res.status(201).json(comment);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Failed to add comment",
    });
  }
};

export const getBugCommentsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const bugId = String(req.params.id);

    const comments = await prisma.bugComment.findMany({
      where: { bugId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json(comments);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Failed to fetch comments",
    });
  }
};

export const updateBugCommentController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const commentId = String(req.params.id);
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        message: "Updated content is required",
      });
    }

    const comment = await prisma.bugComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Author check
    if (comment.authorId !== req.user!.id) {
      return res.status(403).json({
        message: "You can only edit your own comments",
      });
    }

    // 5 minute rule
    const FIVE_MINUTES = 5 * 60 * 1000;
    const now = new Date().getTime();
    const createdAt = new Date(comment.createdAt).getTime();

    if (now - createdAt > FIVE_MINUTES) {
      return res.status(403).json({
        message: "Comment can only be edited within 5 minutes",
      });
    }

    const updatedComment = await prisma.bugComment.update({
      where: { id: commentId },
      data: { content },
    });

    return res.status(200).json(updatedComment);
  } catch {
    return res.status(500).json({
      message: "Failed to update comment",
    });
  }
};

export const deleteBugCommentController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const commentId = String(req.params.id);

    const comment = await prisma.bugComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Author check
    if (comment.authorId !== req.user!.id) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    // 5 minute rule
    const FIVE_MINUTES = 5 * 60 * 1000;
    const now = new Date().getTime();
    const createdAt = new Date(comment.createdAt).getTime();

    if (now - createdAt > FIVE_MINUTES) {
      return res.status(403).json({
        message: "Comment can only be deleted within 5 minutes",
      });
    }

    await prisma.bugComment.delete({
      where: { id: commentId },
    });

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Failed to delete comment",
    });
  }
};