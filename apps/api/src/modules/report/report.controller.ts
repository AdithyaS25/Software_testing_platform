import { Request, Response } from "express";
import { generateTestExecutionReport } from "./report.service";

export async function getTestExecutionReport(req: Request, res: Response) {
  const testRunId = req.params.testRunId;

  if (!testRunId || typeof testRunId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid testRunId"
    });
  }

  const report = await generateTestExecutionReport(testRunId);

  return res.status(200).json({
    success: true,
    data: report
  });
}
