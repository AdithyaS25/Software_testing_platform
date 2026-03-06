// File: apps/api/src/modules/test-run/testRun.controller.ts
/// <reference path="../../types/express.d.ts" />
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../types/auth-request';
import {
  createTestRunService,
  getAllTestRunsService,
  getTestRunByIdService,
  deleteTestRunService, // ✅ new
} from './testRun.service';
import { prisma } from '../../prisma';
import { notifyTestRunAssigned } from '../notification/notification.service';

/* ============================
   CREATE TEST RUN
============================ */
export const createTestRunController = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const projectId = Array.isArray(req.params.projectId)
    ? req.params.projectId[0]
    : req.params.projectId;
  if (!projectId)
    return res.status(400).json({ message: 'Project ID is required' });

  const { name, description, startDate, endDate, testCaseIds } = req.body;
  const userId = authReq.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const testRun = await createTestRunService(
    projectId,
    name,
    description,
    startDate ? new Date(startDate) : new Date(),
    endDate ? new Date(endDate) : new Date(),
    testCaseIds ?? [],
    userId
  );

  res.status(201).json(testRun);
};

/* ============================
   GET ALL TEST RUNS
============================ */
export const getAllTestRunsController = async (req: Request, res: Response) => {
  const projectId = Array.isArray(req.params.projectId)
    ? req.params.projectId[0]
    : req.params.projectId;
  if (!projectId)
    return res.status(400).json({ message: 'Project ID is required' });

  const runs = await getAllTestRunsService(projectId);
  res.status(200).json(runs);
};

/* ============================
   GET TEST RUN BY ID
============================ */
export const getTestRunByIdController = async (req: Request, res: Response) => {
  const projectId = Array.isArray(req.params.projectId)
    ? req.params.projectId[0]
    : req.params.projectId;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!projectId || !id)
    return res.status(400).json({ message: 'Invalid parameters' });

  const run = await getTestRunByIdService(projectId, id);
  if (!run) return res.status(404).json({ message: 'Test run not found' });

  res.status(200).json(run);
};

/* ============================
   DELETE TEST RUN  ✅ new
============================ */
export const deleteTestRunController = async (req: Request, res: Response) => {
  const projectId = Array.isArray(req.params.projectId)
    ? req.params.projectId[0]
    : req.params.projectId;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!projectId || !id)
    return res.status(400).json({ message: 'Invalid parameters' });

  const deleted = await deleteTestRunService(projectId, id);
  if (!deleted) return res.status(404).json({ message: 'Test run not found' });

  res.status(200).json({ success: true, message: 'Test run deleted' });
};

/* ============================
   ASSIGN TEST RUN CASE
============================ */
export const assignTestRunCaseController = async (
  req: Request,
  res: Response
) => {
  const projectId = Array.isArray(req.params.projectId)
    ? req.params.projectId[0]
    : req.params.projectId;
  const testRunTestCaseId = Array.isArray(req.params.testRunTestCaseId)
    ? req.params.testRunTestCaseId[0]
    : req.params.testRunTestCaseId;
  const { assignedToId } = req.body;

  if (!projectId || !testRunTestCaseId || !assignedToId) {
    return res.status(400).json({ message: 'Invalid parameters' });
  }

  const testRunTestCase = await prisma.testRunTestCase.findUnique({
    where: { id: testRunTestCaseId },
    include: { testRun: true },
  });
  if (!testRunTestCase) return res.status(404).json({ message: 'Not found' });

  const previousAssignedToId = testRunTestCase.assignedToId;
  const updated = await prisma.testRunTestCase.update({
    where: { id: testRunTestCaseId },
    data: { assignedToId },
  });

  if (assignedToId !== previousAssignedToId) {
    notifyTestRunAssigned({
      assignedToId,
      testRunName: testRunTestCase.testRun.name,
      projectId,
      testRunId: testRunTestCase.testRunId,
    }).catch(console.error);
  }

  return res.status(200).json(updated);
};
