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
  req: Request,
  res: Response
) => {
  try {
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

    const bugCount = await prisma.bug.count();
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
        assignedToId,
        testCaseId,
      },
    });

    return res.status(201).json(bug);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

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

    const bugs = await prisma.bug.findMany({
      where: {
        assignedToId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(bugs);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Failed to fetch assigned bugs",
    });
  }
};

export const getBugsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { status, priority, severity, sortBy, order } = req.query;

    const where: any = {};

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
        ? {
            [String(sortBy)]: order === "asc" ? "asc" : "desc",
          }
        : {
            createdAt: "desc",
          },
    });

    return res.status(200).json(bugs);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Failed to fetch bugs",
    });
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
