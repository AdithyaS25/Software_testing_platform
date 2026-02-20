import { Request, Response } from "express";
import { createTestRunService, getAllTestRunsService, assignTestRunCaseService, getTestRunByIdService } from "./testRun.service";

export const createTestRunController = async (
  req: Request,
  res: Response
) => {
  const { name, description, startDate, endDate, testCaseIds } = req.body;

  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const testRun = await createTestRunService(
    name,
    description,
    new Date(startDate),
    new Date(endDate),
    testCaseIds,
    userId
  );

  res.status(201).json(testRun);
};

export const getAllTestRunsController = async (
  req: Request,
  res: Response
) => {
  const runs = await getAllTestRunsService();
  res.json(runs);
};

export const assignTestRunCaseController = async (
  req: Request,
  res: Response
) => {
  const { testRunTestCaseId, assignedToId } = req.body;

  const updated = await assignTestRunCaseService(
    testRunTestCaseId,
    assignedToId
  );

  res.json(updated);
};

export const getTestRunByIdController = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id as string;

if (!id) {
  return res.status(400).json({ message: "Test Run ID is required" });
}

const run = await getTestRunByIdService(id);
  if (!run) {
    return res.status(404).json({ message: "Test Run not found" });
  }

  res.json(run);
};
