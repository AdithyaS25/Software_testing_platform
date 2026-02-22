import { prisma } from "../../prisma";
import { Express } from "express";
import { Request, Response } from "express";
import {
  createExecutionService,
  updateExecutionService,
  completeExecutionService,
} from "./execution.service";
import { BugSeverity, BugPriority, BugStatus } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
    email?: string;
  };
}

export const createExecutionController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
    const userId = req.user?.id;

if (!userId) {
  return res.status(401).json({ message: "Unauthorized" });
}
    const { testCaseId } = req.body;

  const execution = await createExecutionService(testCaseId, userId);

  return res.status(201).json(execution);
};

export const updateExecutionController = async (
  req: Request,
  res: Response
) => {
  const executionId = req.params.id;

if (!executionId || typeof executionId !== "string") {
  return res.status(400).json({ message: "Invalid execution ID" });
}

  const { steps } = req.body;

  const updatedExecution = await updateExecutionService(
    executionId,
    steps
  );

  return res.status(200).json(updatedExecution);
};

export const completeExecutionController = async (
  req: Request,
  res: Response
) => {
  const executionId = req.params.id;

if (!executionId || typeof executionId !== "string") {
  return res.status(400).json({ message: "Invalid execution ID" });
}

  const completedExecution = await completeExecutionService(
    executionId
  );

  return res.status(200).json(completedExecution);
};


export const uploadExecutionEvidenceController = async (
  req: Request,
  res: Response
) => {
  try {
    const executionId = String(req.params.executionId);
    const stepId = String(req.params.stepId);

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // 1️⃣ Validate execution exists
    const execution = await prisma.execution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      return res.status(404).json({
        message: "Execution not found",
      });
    }

    // 2️⃣ Prevent upload if execution COMPLETED
    if (execution.status === "COMPLETED") {
      return res.status(400).json({
        message: "Cannot upload evidence. Execution is already completed.",
      });
    }

    // 3️⃣ Validate step belongs to execution
    const step = await prisma.executionStep.findUnique({
      where: { id: stepId },
    });

    if (!step || step.executionId !== executionId) {
      return res.status(404).json({
        message: "Execution step not found",
      });
    }

    // 4️⃣ Enforce file size rules per type
    const fileSize = req.file.size;
    const mime = req.file.mimetype;

    if (mime.startsWith("image/") && fileSize > 10 * 1024 * 1024) {
      return res.status(400).json({
        message: "Image exceeds 10MB limit",
      });
    }

    if (mime.startsWith("video/") && fileSize > 100 * 1024 * 1024) {
      return res.status(400).json({
        message: "Video exceeds 100MB limit",
      });
    }

    if (
      (mime === "text/plain" || mime === "application/json") &&
      fileSize > 50 * 1024 * 1024
    ) {
      return res.status(400).json({
        message: "Log file exceeds 50MB limit",
      });
    }

    // 5️⃣ Update step with evidence URL
    const updatedStep = await prisma.executionStep.update({
      where: { id: stepId },
      data: {
        evidenceUrl: `/uploads/${req.file.filename}`,
      },
    });

    return res.status(200).json(updatedStep);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const failAndCreateBugController = async (
  req: Request,
  res: Response
) => {
  const executionId = String(req.params.executionId);
  const stepId = String(req.params.stepId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch execution
      const execution = await tx.execution.findUnique({
        where: { id: executionId },
        include: {
          testCase: true,
        },
      });

      if (!execution) {
        throw new Error("Execution not found");
      }

      if (execution.status === "COMPLETED") {
        throw new Error("Execution already completed");
      }

      // 2️⃣ Fetch step
      const step = await tx.executionStep.findUnique({
        where: { id: stepId },
      });

      if (!step || step.executionId !== executionId) {
        throw new Error("Execution step not found");
      }

      // 3️⃣ Mark step as FAIL
      await tx.executionStep.update({
        where: { id: stepId },
        data: {
          status: "FAIL",
        },
      });

      // 4️⃣ Generate Bug ID
      const bugCount = await tx.bug.count();
      const bugId = `BUG-${new Date().getFullYear()}-${String(
        bugCount + 1
      ).padStart(5, "0")}`;

      // 5️⃣ Create Bug
      const bug = await tx.bug.create({
        data: {
          bugId,
          title: `Failure in ${execution.testCase.title}`,
          description: `Auto-created from execution failure.`,
          expectedBehavior: step.expectedResult ?? "Expected result not provided",
          actualBehavior: step.actualResult ?? "Actual result not provided",
          severity: BugSeverity.MAJOR,
          priority: BugPriority.P3_MEDIUM,
          status: BugStatus.NEW,
          testCaseId: execution.testCaseId,
          executionId: executionId,
          executionStepId: stepId,
        },
      });

      return bug;
    });

    return res.status(201).json(result);
  } catch (error: unknown) {
  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
}
}
