import { Request, Response } from "express";
import { generateDeveloperPerformanceReport } from "./developer-performance.service";

export const getDeveloperPerformanceController =
  async (req: Request, res: Response) => {
    const report =
      await generateDeveloperPerformanceReport();

    return res.status(200).json({
      success: true,
      data: report,
    });
  };
  