import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../types/auth-request";
import {
  createTestRunService,
  getAllTestRunsService,
  getTestRunByIdService
} from "./testRun.service";
import { prisma } from "../../prisma";

/* ============================
   CREATE TEST RUN
============================ */

export const createTestRunController = async (
  req: Request,
  res: Response
) => {
  const authReq = req as AuthenticatedRequest;

  const projectIdParam = req.params.projectId;
  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  const { name, description, startDate, endDate, testCaseIds } = req.body;

  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const testRun = await createTestRunService(
    projectId,
    name,
    description,
    new Date(startDate),
    new Date(endDate),
    testCaseIds,
    userId
  );

  res.status(201).json(testRun);
};

/* ============================
   GET ALL TEST RUNS
============================ */

export const getAllTestRunsController = async (
  req: Request,
  res: Response
) => {
  const projectIdParam = req.params.projectId;
  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  const runs = await getAllTestRunsService(projectId);

  res.status(200).json(runs);
};

/* ============================
   GET TEST RUN BY ID
============================ */

export const getTestRunByIdController = async (
  req: Request,
  res: Response
) => {
  const projectIdParam = req.params.projectId;
  const idParam = req.params.id;

  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!projectId || !id) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const run = await getTestRunByIdService(projectId, id);

  if (!run) {
    return res.status(404).json({ message: "Test run not found" });
  }

  res.status(200).json(run);
};

export const assignTestRunCaseController = async (
  req: Request,
  res: Response
) => {
  const projectIdParam = req.params.projectId;
  const idParam = req.params.testRunTestCaseId;

  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  const testRunTestCaseId = Array.isArray(idParam)
    ? idParam[0]
    : idParam;

  const { assignedToId } = req.body;

  if (!projectId || !testRunTestCaseId || !assignedToId) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const updated = await prisma.testRunTestCase.update({
    where: { id: testRunTestCaseId },
    data: { assignedToId },
  });

  return res.status(200).json(updated);
};