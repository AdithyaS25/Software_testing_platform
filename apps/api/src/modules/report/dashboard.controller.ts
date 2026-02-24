import { Request, Response } from "express";
import { generateDashboardReport } from "./dashboard.service";

export const getDashboardController =
  async (req: Request, res: Response) => {
    const report =
      await generateDashboardReport();

    return res.status(200).json({
      success: true,
      data: report,
    });
  };
  
  