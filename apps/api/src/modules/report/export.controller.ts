import { Request, Response } from "express";
import {
  exportTestExecutionCSV,
  exportBugReportCSV,
} from "./export.service";

/* ============================
   EXPORT TEST EXECUTION CSV
============================ */

export const exportTestExecutionController = async (
  req: Request,
  res: Response
) => {
  const projectIdParam = req.params.projectId;
  const testRunIdParam = req.params.testRunId;

  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  const testRunId = Array.isArray(testRunIdParam)
    ? testRunIdParam[0]
    : testRunIdParam;

  if (!projectId || !testRunId) {
    return res.status(400).json({
      message: "Invalid Project ID or Test Run ID",
    });
  }

  const csv = await exportTestExecutionCSV(
    projectId,
    testRunId
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="test-execution-${testRunId}.csv"`
  );

  return res.status(200).send(csv);
};

/* ============================
   EXPORT BUG REPORT CSV
============================ */

export const exportBugReportController = async (
  req: Request,
  res: Response
) => {
  const projectIdParam = req.params.projectId;

  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  if (!projectId) {
    return res.status(400).json({
      message: "Invalid Project ID",
    });
  }

  const csv = await exportBugReportCSV(projectId);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="bug-report-${projectId}.csv"`
  );

  return res.status(200).send(csv);
};