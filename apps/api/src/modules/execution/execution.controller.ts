import { prisma } from "../../prisma";
import { Request, Response } from "express";
import {
  createExecutionService,
  updateExecutionService,
  completeExecutionService,
} from "./execution.service";

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
  const stepIdParam = req.params.stepId;

if (!stepIdParam || Array.isArray(stepIdParam)) {
  return res.status(400).json({ message: "Invalid stepId" });
}

const stepId: string = stepIdParam;

  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  const updatedStep = await prisma.executionStep.update({
    where: { id: stepId },
    data: {
      evidenceUrl: `/uploads/${req.file.filename}`,
    },
  });

  return res.status(200).json(updatedStep);
};