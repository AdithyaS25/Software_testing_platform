import { Request, Response } from "express";
import { generateTesterPerformanceReport } from "./tester-performance.service";

export const getTesterPerformanceController =
  async (req: Request, res: Response) => {
    const report =
      await generateTesterPerformanceReport();

    return res.status(200).json({
      success: true,
      data: report,
    });
  };
  