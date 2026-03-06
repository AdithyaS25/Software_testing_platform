// File: apps/api/src/modules/report/report.controller.ts

import { Request, Response } from 'express';
import { generateTestExecutionReport } from './report.service';
import { generateBugReport } from './bug-report.service'; // ← new

// ── Test Execution Report ──────────────────────────────────────────────────

export async function getTestExecutionReport(req: Request, res: Response) {
  const { projectId, testRunId } = req.params;

  if (!projectId || typeof projectId !== 'string') {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid projectId' });
  }
  if (!testRunId || typeof testRunId !== 'string') {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid testRunId' });
  }

  const report = await generateTestExecutionReport(projectId, testRunId);
  return res.status(200).json({ success: true, data: report });
}

// ── Bug Report (JSON stats) ────────────────────────────────────────────────

export async function getBugReport(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId || typeof projectId !== 'string') {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid projectId' });
  }

  const report = await generateBugReport(projectId);
  return res.status(200).json({ success: true, data: report });
}
