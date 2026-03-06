// File: apps/api/src/modules/execution/execution.controller.ts

import { prisma } from '../../prisma';
import { RequestHandler } from 'express';
import {
  createExecutionService,
  updateExecutionService,
  completeExecutionService,
} from './execution.service';
import { BugSeverity, BugPriority, BugStatus } from '@prisma/client';

export const createExecutionController: RequestHandler = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  const { testCaseId, testRunId } = req.body;
  if (!testCaseId || !testRunId)
    return res
      .status(400)
      .json({ message: 'testCaseId and testRunId are required' });
  const execution = await createExecutionService(testCaseId, testRunId, userId);
  return res
    .status(201)
    .json({ message: 'Execution created successfully', data: execution });
};

export const updateExecutionController: RequestHandler = async (req, res) => {
  const executionId = String(req.params.id);
  if (!executionId)
    return res.status(400).json({ message: 'Invalid execution ID' });
  const updated = await updateExecutionService(executionId, req.body);
  return res
    .status(200)
    .json({ message: 'Execution updated successfully', data: updated });
};

export const completeExecutionController: RequestHandler = async (req, res) => {
  const executionId = String(req.params.id);
  if (!executionId)
    return res.status(400).json({ message: 'Invalid execution ID' });
  const completed = await completeExecutionService(executionId);
  return res
    .status(200)
    .json({ message: 'Execution completed successfully', data: completed });
};

export const uploadExecutionEvidenceController: RequestHandler = async (
  req,
  res
) => {
  try {
    const executionId = String(req.params.executionId);
    const stepId = String(req.params.stepId);

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const execution = await prisma.execution.findUnique({
      where: { id: executionId },
    });
    if (!execution)
      return res.status(404).json({ message: 'Execution not found' });
    if (execution.status === 'COMPLETED')
      return res.status(400).json({
        message: 'Cannot upload evidence. Execution already completed.',
      });

    const step = await prisma.executionStep.findUnique({
      where: { id: stepId },
    });
    if (!step || step.executionId !== executionId)
      return res.status(404).json({ message: 'Execution step not found' });

    const updated = await prisma.executionStep.update({
      where: { id: stepId },
      data: { evidenceUrl: `/uploads/${req.file.filename}` },
    });
    return res
      .status(200)
      .json({ message: 'Evidence uploaded successfully', data: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const failAndCreateBugController: RequestHandler = async (req, res) => {
  const { executionId, stepId } = req.params;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const execution = await tx.execution.findUnique({
        where: { id: String(executionId) },
        include: { testCase: true },
      });
      if (!execution) throw new Error('Execution not found');
      if (execution.status === 'COMPLETED')
        throw new Error('Execution already completed');

      const step = await tx.executionStep.findUnique({
        where: { id: String(stepId) },
      });
      if (!step || step.executionId !== executionId)
        throw new Error('Execution step not found');

      await tx.executionStep.update({
        where: { id: String(stepId) },
        data: { status: 'FAIL' },
      });

      // ✅ Fixed: use findFirst + desc ordering (same as bug.service.ts nextBugId)
      // The old count+1 approach causes unique constraint violations under concurrent calls
      const year = new Date().getFullYear();
      const prefix = `BUG-${year}-`;
      const last = await tx.bug.findFirst({
        where: {
          bugId: { startsWith: prefix },
          projectId: execution.testCase.projectId,
        },
        orderBy: { bugId: 'desc' },
        select: { bugId: true },
      });
      let next = 1;
      if (last?.bugId) {
        const seq = parseInt(last.bugId.replace(prefix, ''), 10);
        if (!isNaN(seq)) next = seq + 1;
      }
      const bugId = `${prefix}${String(next).padStart(5, '0')}`;

      const body = req.body || {};

      return tx.bug.create({
        data: {
          bugId,
          title:
            body.title ||
            `Failure in step ${step.stepNumber} of ${execution.testCase.title}`,
          description:
            body.description || `Auto-created from execution failure.`,
          expectedBehavior:
            step.expectedResult ?? 'Expected result not provided',
          actualBehavior: step.actualResult ?? 'Actual result not provided',
          severity: (body.severity as BugSeverity) || BugSeverity.MAJOR,
          priority: (body.priority as BugPriority) || BugPriority.P3_MEDIUM,
          status: BugStatus.NEW,
          testCaseId: execution.testCaseId,
          executionId,
          executionStepId: String(stepId),
          projectId: execution.testCase.projectId,
        },
      });
    });
    return res
      .status(201)
      .json({ message: 'Bug created successfully', data: result });
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(400).json({ message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
