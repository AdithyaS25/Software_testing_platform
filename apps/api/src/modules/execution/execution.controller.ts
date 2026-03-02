import { prisma } from "../../prisma";
import { RequestHandler } from "express";
import {
  createExecutionService,
  updateExecutionService,
  completeExecutionService,
} from "./execution.service";
import { BugSeverity, BugPriority, BugStatus } from "@prisma/client";

/* =========================
   CREATE EXECUTION
========================= */

export const createExecutionController: RequestHandler = async (
  req,
  res
) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { testCaseId, testRunId } = req.body;

  if (!testCaseId || !testRunId) {
    return res.status(400).json({
      message: "testCaseId and testRunId are required",
    });
  }

  const execution = await createExecutionService(
    testCaseId,
    testRunId,
    userId
  );

  return res.status(201).json({
    message: "Execution created successfully",
    data: execution,
  });
};

/* =========================
   UPDATE EXECUTION
========================= */

export const updateExecutionController: RequestHandler = async (
  req,
  res
) => {
  const executionId = String(req.params.id);

  if (!executionId) {
    return res.status(400).json({ message: "Invalid execution ID" });
  }

  const updatedExecution = await updateExecutionService(
    executionId,
    req.body
  );

  return res.status(200).json({
    message: "Execution updated successfully",
    data: updatedExecution,
  });
};

/* =========================
   COMPLETE EXECUTION
========================= */

export const completeExecutionController: RequestHandler = async (
  req,
  res
) => {
  const executionId = String(req.params.id);

  if (!executionId) {
    return res.status(400).json({ message: "Invalid execution ID" });
  }

  const completedExecution =
    await completeExecutionService(executionId);

  return res.status(200).json({
    message: "Execution completed successfully",
    data: completedExecution,
  });
};
/* =========================
   UPLOAD EVIDENCE
========================= */

export const uploadExecutionEvidenceController: RequestHandler =
  async (req, res) => {
    try {
      const executionId = String(req.params.executionId);
      const stepId = String(req.params.stepId);

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      const execution = await prisma.execution.findUnique({
        where: { id: executionId },
      });

      if (!execution) {
        return res.status(404).json({
          message: "Execution not found",
        });
      }

      if (execution.status === "COMPLETED") {
        return res.status(400).json({
          message:
            "Cannot upload evidence. Execution is already completed.",
        });
      }

      const step = await prisma.executionStep.findUnique({
        where: { id: stepId },
      });

      if (!step || step.executionId !== executionId) {
        return res.status(404).json({
          message: "Execution step not found",
        });
      }

      const updatedStep = await prisma.executionStep.update({
        where: { id: stepId },
        data: {
          evidenceUrl: `/uploads/${req.file.filename}`,
        },
      });

      return res.status(200).json({
        message: "Evidence uploaded successfully",
        data: updatedStep,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };

/* =========================
   FAIL STEP & CREATE BUG
========================= */

export const failAndCreateBugController: RequestHandler =
  async (req, res) => {
    const executionId = String(req.params.executionId);
    const stepId = String(req.params.stepId);

    try {
      const result = await prisma.$transaction(async (tx) => {
        const execution = await tx.execution.findUnique({
          where: { id: executionId },
          include: { testCase: true },
        });

        if (!execution) {
          throw new Error("Execution not found");
        }

        if (execution.status === "COMPLETED") {
          throw new Error("Execution already completed");
        }

        const step = await tx.executionStep.findUnique({
          where: { id: stepId },
        });

        if (!step || step.executionId !== executionId) {
          throw new Error("Execution step not found");
        }

        await tx.executionStep.update({
          where: { id: stepId },
          data: { status: "FAIL" },
        });

        const bugCount = await tx.bug.count();

        const bugId = `BUG-${new Date().getFullYear()}-${String(
          bugCount + 1
        ).padStart(5, "0")}`;

        const bug = await tx.bug.create({
          data: {
            bugId,
            title: `Failure in ${execution.testCase.title}`,
            description:
              "Auto-created from execution failure.",
            expectedBehavior:
              step.expectedResult ??
              "Expected result not provided",
            actualBehavior:
              step.actualResult ??
              "Actual result not provided",
            severity: BugSeverity.MAJOR,
            priority: BugPriority.P3_MEDIUM,
            status: BugStatus.NEW,
            testCaseId: execution.testCaseId,
            executionId,
            executionStepId: stepId,
            projectId: execution.testCase.projectId ?? 'default-project-001',
          },
        });

        return bug;
      });

      return res.status(201).json({
        message: "Bug created successfully",
        data: result,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
