import { Request, Response } from "express";
import { generateBugReport } from "./bug-report.service";

export const getBugReportController = async (
  req: Request,
  res: Response
) => {
  const report = await generateBugReport();

  return res.status(200).json({
    success: true,
    data: report,
  });
};
