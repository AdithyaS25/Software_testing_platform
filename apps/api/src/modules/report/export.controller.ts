import { Request, Response } from "express";
import {
  exportTestExecutionCSV,
  exportBugReportCSV,
} from "./export.service";

export const exportTestExecutionController = async (
  req: Request,
  res: Response
) => {
  const param = req.params.testRunId;

  if (!param || Array.isArray(param)) {
    return res.status(400).json({
      message: "Invalid Test Run ID",
    });
  }

  const csv = await exportTestExecutionCSV(param);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="test-execution-${param}.csv"`
  );

  return res.status(200).send(csv);
};

export const exportBugReportController = async (
  req: Request,
  res: Response
) => {
  const csv = await exportBugReportCSV();

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="bug-report.csv"`
  );

  return res.status(200).send(csv);
};
