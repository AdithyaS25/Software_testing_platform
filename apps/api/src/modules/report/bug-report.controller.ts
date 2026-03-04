import { Request, Response } from "express";
import { generateBugReport } from "./bug-report.service";

export const getBugReportController = async (
  req: Request,
  res: Response
) => {
  const projectId = req.params.projectId as string;

  const report = await generateBugReport(projectId);

  return res.status(200).json({
    success: true,
    data: report,
  });
};
